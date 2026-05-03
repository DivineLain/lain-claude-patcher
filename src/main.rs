// SPDX-License-Identifier: GLWTPL
/*
 * main.rs
 *
 * Version: @(#)main.rs 1.0.0 2026
 *
 * Description: Cave Man Claude Patcher.
 *              Claude font tiny. Cave man eyes hurt.
 *              Claude theme boring. Cave man soul hurt.
 *              2K and 4K monitors make tiny text worse. Accessibility suffers.
 *              Users ask for custom CSS. Anthropic gives shrug. Cave man patch.
 *              User owns local app surface. User wants readable UI. User wins.
 *              No Claude binaries shipped. No account bypass. No magic theft.
 *              Local install in. Local patched copy out. Backup before smash.
 *
 *              Anthropic sucks here because the app should expose custom theme
 *              and readable font controls out of the box. Instead users get
 *              tiny text, dull colors, and corporate gaslight when they complain.
 *              Cave man no accept. Cave man inject JavaScript.
 *
 *
 *        ██▓    ▄▄▄     ▓██   ██▓▓█████  ██▀███
 *       ▓██▒   ▒████▄    ▒██  ██▒▓█   ▀ ▓██ ▒ ██▒
 *       ▒██░   ▒██  ▀█▄   ▒██ ██░▒███   ▓██ ░▄█ ▒
 *       ▒██░   ░██▄▄▄▄██  ░ ▐██▓░▒▓█ ▄ ▒██▀▀█▄
 *       ░██████▒▓█   ▓██▒ ░ ██▒▓░░▒████▒░██▓ ▒██▒
 *       ░ ▒░▓  ░▒▒   ▓▒█░  ██▒▒▒ ░░ ▒░ ░░ ▒▓ ░▒▓░
 *       ░ ░ ▒  ░ ▒   ▒▒ ░▓██ ░▒░  ░ ░  ░  ░▒ ░ ▒░
 *         ░ ░    ░   ▒   ▒ ▒ ░░     ░     ░░   ░
 *           ░  ░     ░  ░░ ░        ░  ░   ░
 */

use anyhow::{bail, Context, Result};
use asar::AsarReader;
use clap::{Parser, Subcommand};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    collections::BTreeMap,
    env,
    fs::{self, File},
    io::{self, Write},
    path::{Path, PathBuf},
    process::Command,
};
use time::{format_description::well_known::Rfc3339, OffsetDateTime};
use walkdir::WalkDir;

const SENTINEL: &[u8] = b"dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX";
const FUSE_ENABLE_EMBEDDED_ASAR_INTEGRITY_VALIDATION: usize = 4;
const FUSE_DISABLED: u8 = b'0';
const BLOCK_SIZE: usize = 4 * 1024 * 1024;
const MAIN_VIEW: &str = ".vite/build/mainView.js";
const DEFAULT_IIFE: &str = include_str!("../assets/io-claude-theme.js");
const ORANGE: (u8, u8, u8) = (255, 106, 0);
const YELLOW: (u8, u8, u8) = (255, 234, 0);

/*
 * CAVEMAN CLI.
 *
 * User say install. Cave man copy or patch.
 * User say restore. Cave man put old ASAR back.
 * User say launch. Cave man start patched binary.
 */
#[derive(Parser, Debug)]
#[command(author, version, about = "Patch Claude Desktop with a preload IIFE theme.")]
struct Cli {
    #[command(subcommand)]
    command: Option<CommandArgs>,
}

#[derive(Subcommand, Debug)]
enum CommandArgs {
    Install(InstallArgs),
    Restore(RestoreArgs),
}

#[derive(Parser, Debug)]
struct InstallArgs {
    #[arg(
        long,
        help = "Source Claude app folder containing Claude.exe and resources/app.asar. If omitted, searches known install layouts."
    )]
    source: Option<PathBuf>,

    #[arg(
        long,
        help = "Destination lab app folder. Defaults to %LocalAppData%\\LainClaude\\app."
    )]
    out: Option<PathBuf>,

    #[arg(long, help = "JavaScript IIFE file to append. Defaults to bundled io-claude-theme.js.")]
    iife: Option<PathBuf>,

    #[arg(long, help = "Patch the source folder itself. Default copies source to --out first.")]
    in_place: bool,

    #[arg(long, help = "Launch the patched exe after patching.")]
    launch: bool,

    #[arg(long, help = "Launch with CLAUDE_DEV_TOOLS=detach.")]
    enable_console: bool,

    #[arg(long, help = "Do not create or update the desktop shortcut.")]
    no_shortcut: bool,
}

#[derive(Parser, Debug)]
struct RestoreArgs {
    #[arg(
        long,
        help = "Patched app folder to restore. Defaults to %LocalAppData%\\LainClaude\\app."
    )]
    target: Option<PathBuf>,
}

/*
 * CAVEMAN ENTRY.
 *
 * No command? Cave man bark usage.
 * Command exists? Cave man dispatch.
 */
fn main() -> Result<()> {
    enable_ansi_colors();
    let cli = Cli::parse();
    match cli.command {
        Some(CommandArgs::Install(args)) => install(args),
        Some(CommandArgs::Restore(args)) => restore(args),
        None => interactive_menu(),
    }
}

#[cfg(windows)]
fn enable_ansi_colors() {
    use windows_sys::Win32::{
        Foundation::INVALID_HANDLE_VALUE,
        System::Console::{
            GetConsoleMode, GetStdHandle, SetConsoleMode, ENABLE_VIRTUAL_TERMINAL_PROCESSING,
            STD_OUTPUT_HANDLE,
        },
    };

    unsafe {
        let handle = GetStdHandle(STD_OUTPUT_HANDLE);
        if handle == INVALID_HANDLE_VALUE || handle.is_null() {
            return;
        }

        let mut mode = 0;
        if GetConsoleMode(handle, &mut mode) == 0 {
            return;
        }

        let _ = SetConsoleMode(handle, mode | ENABLE_VIRTUAL_TERMINAL_PROCESSING);
    }
}

#[cfg(not(windows))]
fn enable_ansi_colors() {}

/*
 * CAVEMAN MENU.
 *
 * Double-click open. Cave man show choices.
 * User press number. Cave man do thing.
 * User press exit. Cave man leave clean.
 */
fn interactive_menu() -> Result<()> {
    print_banner()?;
    cave_line("[ACK] no args. Cave man menu open.")?;
    cave_line("1. Install lab copy and launch")?;
    cave_line("2. Install lab copy only")?;
    cave_line("3. Install lab copy, launch with DevTools")?;
    cave_line("4. Restore lab copy from newest backup")?;
    cave_line("5. Exit")?;
    cave_prompt("Pick number: ")?;

    let mut choice = String::new();
    io::stdin()
        .read_line(&mut choice)
        .context("failed to read menu choice")?;

    match choice.trim() {
        "1" => install_inner(default_install_args(true, false), false),
        "2" => install_inner(default_install_args(false, false), false),
        "3" => install_inner(default_install_args(true, true), false),
        "4" => restore_inner(RestoreArgs { target: None }, false),
        "5" | "q" | "Q" | "exit" | "EXIT" => {
            cave_line("[OK] exit")?;
            Ok(())
        }
        other => {
            cave_line(&format!("[ERR] unknown choice: {other}"))?;
            cave_line("[OK] exit")?;
            Ok(())
        }
    }
}

fn default_install_args(launch: bool, enable_console: bool) -> InstallArgs {
    InstallArgs {
        source: None,
        out: None,
        iife: None,
        in_place: false,
        launch,
        enable_console,
        no_shortcut: false,
    }
}

/*
 * CAVEMAN INSTALL.
 *
 * Find Claude. Pick target. Copy unless user says in-place.
 * Kill running Claude. Backup first. Flip fuse. Patch ASAR. Optional launch.
 */
fn install(args: InstallArgs) -> Result<()> {
    install_inner(args, true)
}

fn install_inner(args: InstallArgs, show_banner: bool) -> Result<()> {
    if show_banner {
        print_banner()?;
    }
    let source = match args.source {
        Some(path) => path.canonicalize().context("source folder not found")?,
        None => find_claude_install().context("failed to auto-detect Claude install")?,
    };
    let target = if args.in_place {
        if args.out.is_some() {
            bail!("--out cannot be used with --in-place");
        }
        source.clone()
    } else {
        match args.out {
            Some(path) => path,
            None => default_out_dir()?,
        }
    };
    let iife = match args.iife {
        Some(path) => fs::read_to_string(&path)
            .with_context(|| format!("failed to read IIFE file {}", path.display()))?,
        None => {
            cave_line("[ACK] using bundled io-claude-theme.js")?;
            DEFAULT_IIFE.to_string()
        }
    };

    validate_claude_app(&source)?;
    close_claude_instances()?;

    cave_line(&format!("[ACK] source: {}", source.display()))?;
    cave_line(&format!("[ACK] target: {}", target.display()))?;

    if args.in_place {
        cave_line("[WARN] patching source folder in-place")?;
    } else if target.exists() {
        cave_line("[WARN] removing existing output folder")?;
        fs::remove_dir_all(&target).with_context(|| format!("failed to remove {}", target.display()))?;
    }

    if !args.in_place {
        copy_dir(&source, &target)?;
    }

    create_backup(&target)?;

    let exe = target.join("Claude.exe");
    let lab_exe = if args.in_place {
        exe.clone()
    } else {
        target.join("Claude.no-asar-integrity.exe")
    };
    if !args.in_place {
        fs::copy(&exe, &lab_exe).context("failed to clone Claude.exe")?;
    }
    disable_asar_integrity_fuse(&lab_exe)?;

    let asar_path = target.join("resources").join("app.asar");
    patch_asar(&asar_path, &iife)?;

    cave_line(&format!("[DONE] patched exe: {}", lab_exe.display()))?;
    cave_line(&format!("[DONE] patched asar: {}", asar_path.display()))?;

    if !args.no_shortcut {
        match create_desktop_shortcut(&lab_exe) {
            Ok(path) => cave_line(&format!("[DONE] desktop shortcut: {}", path.display()))?,
            Err(err) => cave_line(&format!("[WARN] desktop shortcut failed: {err:#}"))?,
        }
    }

    if args.launch {
        cave_line("[ACK] launching patched Claude")?;
        let mut command = Command::new(&lab_exe);
        if args.enable_console {
            command.env("CLAUDE_DEV_TOOLS", "detach");
        }
        command.spawn().context("failed to launch patched Claude")?;
    }

    Ok(())
}

#[cfg(windows)]
fn create_desktop_shortcut(target: &Path) -> Result<PathBuf> {
    let target = target
        .canonicalize()
        .with_context(|| format!("failed to canonicalize {}", target.display()))?;
    let workdir = target
        .parent()
        .context("patched exe has no parent directory")?
        .to_path_buf();
    let script = r#"
$ErrorActionPreference = 'Stop'
$ws = New-Object -ComObject WScript.Shell
$desktop = $ws.SpecialFolders.Item('Desktop')
$linkPath = Join-Path $desktop 'Lain Claude.lnk'
$shortcut = $ws.CreateShortcut($linkPath)
$shortcut.TargetPath = $args[0]
$shortcut.WorkingDirectory = $args[1]
$shortcut.IconLocation = $args[0] + ',0'
$shortcut.Description = 'Launch patched Claude Desktop'
$shortcut.Save()
Write-Output $linkPath
"#;
    let output = Command::new("powershell")
        .args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script])
        .arg(&target)
        .arg(&workdir)
        .output()
        .context("failed to run PowerShell shortcut creator")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        bail!("{}", stderr.trim());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let link = stdout
        .lines()
        .last()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .context("shortcut creator did not return a path")?;
    Ok(PathBuf::from(link))
}

#[cfg(not(windows))]
fn create_desktop_shortcut(_target: &Path) -> Result<PathBuf> {
    bail!("desktop shortcuts are only supported on Windows")
}

/*
 * CAVEMAN RESTORE.
 *
 * Find newest backup. Put old app.asar back.
 * Put old Claude.exe back when backup has it.
 * Remove lab exe because restored app should be boring again.
 */
fn restore(args: RestoreArgs) -> Result<()> {
    restore_inner(args, true)
}

fn restore_inner(args: RestoreArgs, show_banner: bool) -> Result<()> {
    if show_banner {
        print_banner()?;
    }
    let target = match args.target {
        Some(path) => path,
        None => default_out_dir()?,
    };
    validate_claude_app(&target)?;
    let backup_root = target.join("lain-backups");
    let latest = latest_backup(&backup_root)?;
    cave_line(&format!("[ACK] restoring from {}", latest.display()))?;

    fs::copy(latest.join("app.asar"), target.join("resources").join("app.asar"))
        .context("failed to restore app.asar")?;
    let backup_exe = latest.join("Claude.exe");
    if backup_exe.is_file() {
        fs::copy(&backup_exe, target.join("Claude.exe")).context("failed to restore Claude.exe")?;
    }
    let lab_exe = target.join("Claude.no-asar-integrity.exe");
    if lab_exe.exists() {
        fs::remove_file(lab_exe).context("failed to remove lab exe")?;
    }
    cave_line(&format!("[DONE] restored {}", target.display()))?;
    Ok(())
}

/*
 * CAVEMAN VALIDATE.
 *
 * Claude folder must have Claude.exe.
 * Claude folder must have resources/app.asar.
 */
fn validate_claude_app(dir: &Path) -> Result<()> {
    let exe = dir.join("Claude.exe");
    let asar = dir.join("resources").join("app.asar");
    if !exe.is_file() {
        bail!("missing {}", exe.display());
    }
    if !asar.is_file() {
        bail!("missing {}", asar.display());
    }
    Ok(())
}

/*
 * CAVEMAN FIND CLAUDE.
 *
 * Store Claude lives under WindowsApps.
 * Squirrel Claude lives under LocalAppData\AnthropicClaude\app-*.
 * Cave man collect both. Highest version wins.
 */
#[derive(Debug)]
struct ClaudeCandidate {
    version: Vec<u64>,
    modified: Option<std::time::SystemTime>,
    path: PathBuf,
}

fn find_claude_install() -> Result<PathBuf> {
    let mut candidates = Vec::new();
    collect_store_claude_candidates(&mut candidates);
    collect_local_claude_candidates(&mut candidates);

    candidates.sort_by(|a, b| {
        a.version
            .cmp(&b.version)
            .then_with(|| a.modified.cmp(&b.modified))
            .then_with(|| a.path.cmp(&b.path))
    });
    candidates
        .pop()
        .map(|candidate| candidate.path)
        .context("no Claude install found in Store or LocalAppData")
}

fn collect_store_claude_candidates(candidates: &mut Vec<ClaudeCandidate>) {
    let Some(program_files) = env::var_os("ProgramFiles") else {
        return;
    };
    let windows_apps = PathBuf::from(program_files).join("WindowsApps");
    let Ok(entries) = fs::read_dir(&windows_apps) else {
        return;
    };

    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if !(name.starts_with("Claude_") && name.contains("_x64__")) {
            continue;
        }
        let app = entry.path().join("app");
        if app.join("Claude.exe").is_file() && app.join("resources").join("app.asar").is_file() {
            candidates.push(ClaudeCandidate {
                version: parse_store_claude_version(&name),
                modified: entry.metadata().and_then(|metadata| metadata.modified()).ok(),
                path: app,
            });
        }
    }
}

fn collect_local_claude_candidates(candidates: &mut Vec<ClaudeCandidate>) {
    let Some(local) = env::var_os("LOCALAPPDATA") else {
        return;
    };
    let root = PathBuf::from(local).join("AnthropicClaude");
    let Ok(entries) = fs::read_dir(&root) else {
        return;
    };

    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if !name.starts_with("app-") {
            continue;
        }
        let app = entry.path();
        if app.join("Claude.exe").is_file() && app.join("resources").join("app.asar").is_file() {
            candidates.push(ClaudeCandidate {
                version: parse_local_claude_version(&name),
                modified: entry.metadata().and_then(|metadata| metadata.modified()).ok(),
                path: app,
            });
        }
    }
}

fn parse_store_claude_version(name: &str) -> Vec<u64> {
    name.strip_prefix("Claude_")
        .and_then(|rest| rest.split('_').next())
        .map(parse_version_numbers)
        .unwrap_or_default()
}

fn parse_local_claude_version(name: &str) -> Vec<u64> {
    name.strip_prefix("app-")
        .map(parse_version_numbers)
        .unwrap_or_default()
}

fn parse_version_numbers(text: &str) -> Vec<u64> {
    text.split(|ch: char| !ch.is_ascii_digit())
        .filter(|part| !part.is_empty())
        .filter_map(|part| part.parse().ok())
        .collect()
}

/*
 * CAVEMAN DEFAULT OUT.
 *
 * Lab copy lives in LocalAppData.
 * Real install stays untouched unless user says --in-place.
 */
fn default_out_dir() -> Result<PathBuf> {
    let local = env::var_os("LOCALAPPDATA").context("LOCALAPPDATA is not set")?;
    Ok(PathBuf::from(local).join("LainClaude").join("app"))
}

/*
 * CAVEMAN BACKUP.
 *
 * Before smash, copy app.asar and Claude.exe.
 * Restore command eats this folder later.
 */
fn create_backup(target: &Path) -> Result<()> {
    let asar = target.join("resources").join("app.asar");
    let exe = target.join("Claude.exe");
    let stamp = OffsetDateTime::now_local()
        .unwrap_or_else(|_| OffsetDateTime::now_utc())
        .format(&Rfc3339)?
        .replace(':', "")
        .replace('-', "")
        .replace('T', "-")
        .replace('Z', "");
    let backup = target.join("lain-backups").join(stamp);
    fs::create_dir_all(&backup)?;
    fs::copy(&asar, backup.join("app.asar")).context("failed to backup app.asar")?;
    fs::copy(&exe, backup.join("Claude.exe")).context("failed to backup Claude.exe")?;
    cave_line(&format!("[OK] backup: {}", backup.display()))?;
    Ok(())
}

/*
 * CAVEMAN LATEST BACKUP.
 *
 * Backup folders sort by timestamp.
 * Newest usable folder wins.
 */
fn latest_backup(backup_root: &Path) -> Result<PathBuf> {
    let mut backups = Vec::new();
    for entry in fs::read_dir(backup_root)
        .with_context(|| format!("failed to read {}", backup_root.display()))?
    {
        let entry = entry?;
        if entry.file_type()?.is_dir() && entry.path().join("app.asar").is_file() {
            backups.push(entry.path());
        }
    }
    backups.sort();
    backups.pop().context("no usable backups found")
}

/*
 * CAVEMAN COPY.
 *
 * Walk source. Make dirs. Copy files.
 * No clever sync. Clean lab folder already handled.
 */
fn copy_dir(source: &Path, out: &Path) -> Result<()> {
    cave_line("[ACK] copying app folder")?;
    for entry in WalkDir::new(source) {
        let entry = entry?;
        let rel = entry.path().strip_prefix(source)?;
        let dst = out.join(rel);
        if entry.file_type().is_dir() {
            fs::create_dir_all(&dst)?;
        } else if entry.file_type().is_file() {
            if let Some(parent) = dst.parent() {
                fs::create_dir_all(parent)?;
            }
            fs::copy(entry.path(), &dst)
                .with_context(|| format!("copy {} -> {}", entry.path().display(), dst.display()))?;
        }
    }
    Ok(())
}

/*
 * CAVEMAN KILL CLAUDE.
 *
 * Running Electron holds files and single-instance lock.
 * Cave man closes stock Claude and patched Claude before patch.
 * taskkill no find process? Cave man no care.
 */
fn close_claude_instances() -> Result<()> {
    cave_line("[ACK] closing running Claude instances")?;
    for image in ["Claude.exe", "Claude.no-asar-integrity.exe"] {
        let _ = Command::new("taskkill")
            .args(["/IM", image, "/F"])
            .output();
    }
    Ok(())
}

/*
 * CAVEMAN FUSE.
 *
 * Electron hides fuse wire after sentinel bytes.
 * Fuse index 4 means embedded ASAR integrity validation.
 * Cave man set byte to '0'. Patched ASAR boots.
 */
fn disable_asar_integrity_fuse(exe: &Path) -> Result<()> {
    cave_line("[ACK] disabling ASAR integrity fuse on exe copy")?;
    let mut bytes = fs::read(exe).with_context(|| format!("failed to read {}", exe.display()))?;
    let positions = find_all(&bytes, SENTINEL);
    if positions.is_empty() {
        bail!("Electron fuse sentinel not found in {}", exe.display());
    }
    if positions.len() > 2 {
        bail!("unexpected fuse sentinel count: {}", positions.len());
    }

    for pos in positions {
        let header = pos + SENTINEL.len();
        if header + 2 > bytes.len() {
            bail!("truncated fuse header");
        }
        let version = bytes[header];
        let len = bytes[header + 1] as usize;
        if version != 1 {
            bail!("unsupported Electron fuse version: {}", version);
        }
        if len <= FUSE_ENABLE_EMBEDDED_ASAR_INTEGRITY_VALIDATION {
            bail!("fuse wire too short: {}", len);
        }
        let fuse_pos = header + 2 + FUSE_ENABLE_EMBEDDED_ASAR_INTEGRITY_VALIDATION;
        bytes[fuse_pos] = FUSE_DISABLED;
    }

    fs::write(exe, bytes).with_context(|| format!("failed to write {}", exe.display()))?;
    Ok(())
}

/*
 * CAVEMAN FIND BYTES.
 *
 * Need sentinel positions. Scan bytes. Return offsets.
 */
fn find_all(haystack: &[u8], needle: &[u8]) -> Vec<usize> {
    let mut positions = Vec::new();
    let mut start = 0;
    while start + needle.len() <= haystack.len() {
        if let Some(idx) = haystack[start..].windows(needle.len()).position(|w| w == needle) {
            let pos = start + idx;
            positions.push(pos);
            start = pos + 1;
        } else {
            break;
        }
    }
    positions
}

/*
 * CAVEMAN ASAR PATCH.
 *
 * Read ASAR. Find mainView.js. Inject IIFE.
 * Rebuild archive. Native files stay unpacked.
 */
fn patch_asar(asar_path: &Path, iife: &str) -> Result<()> {
    cave_line("[ACK] patching app.asar")?;
    let original = fs::read(asar_path).with_context(|| format!("failed to read {}", asar_path.display()))?;
    let reader = AsarReader::new(&original, asar_path.to_path_buf()).context("failed to parse app.asar")?;

    let main_file = reader
        .files()
        .iter()
        .find(|(path, _)| normalize_asar_path(path) == MAIN_VIEW)
        .map(|(_, file)| file)
        .with_context(|| format!("missing {}", MAIN_VIEW))?;
    let main_js = std::str::from_utf8(main_file.data()).context("mainView.js is not valid UTF-8")?;
    let patched_main = inject_iife(main_js, iife)?;

    let unpack_dir = asar_path.with_extension("asar.unpacked");
    if unpack_dir.exists() {
        fs::remove_dir_all(&unpack_dir)?;
    }
    fs::create_dir_all(&unpack_dir)?;

    let mut files: BTreeMap<PathBuf, Vec<u8>> = BTreeMap::new();
    for (path, file) in reader.files() {
        let data = if normalize_asar_path(path) == MAIN_VIEW {
            patched_main.as_bytes().to_vec()
        } else {
            file.data().to_vec()
        };
        files.insert(path.clone(), data);
    }

    let tmp = asar_path.with_extension("asar.tmp");
    write_asar(&tmp, &unpack_dir, &files)?;
    fs::rename(&tmp, asar_path).context("failed to replace app.asar")?;
    Ok(())
}

/*
 * CAVEMAN INJECT.
 *
 * Put user IIFE before source map marker.
 * Guard by Claude origins. Run after DOM exists.
 */
fn inject_iife(main_js: &str, iife: &str) -> Result<String> {
    let marker = "\n//# sourceMappingURL=mainView.js.map";
    let idx = main_js
        .rfind(marker)
        .context("source map marker not found in mainView.js")?;
    if main_js.contains("[lain-claude-patcher]") {
        bail!("mainView.js already contains lain-claude-patcher injection");
    }
    let wrapped = format!(
        "\ntry{{(()=>{{const __lainClaudeOk=()=>{{try{{const u=new URL(window.location.href),o=u.origin===\"null\"||u.origin===null?`${{u.protocol}}//${{u.host}}`:u.origin;return o===\"https://claude.ai\"||o===\"https://preview.claude.ai\"||o===\"https://claude.com\"||o===\"https://preview.claude.com\"||u.hostname===\"localhost\"||o===\"app://localhost\"||o.endsWith(\".ant.dev\")}}catch{{return false}}}};const __lainClaudeRun=()=>{{if(!__lainClaudeOk())return;{iife}\n}};document.readyState===\"loading\"?document.addEventListener(\"DOMContentLoaded\",__lainClaudeRun,{{once:true}}):__lainClaudeRun();console.log(\"[lain-claude-patcher] IIFE scheduled\")}})()}}catch(e){{console.error(\"[lain-claude-patcher]\",e)}}\n"
    );
    Ok(format!("{}{}{}", &main_js[..idx], wrapped, &main_js[idx..]))
}

/*
 * CAVEMAN WRITE ASAR.
 *
 * Build Electron ASAR header JSON.
 * Packed files go into data blob.
 * Native files go beside archive in app.asar.unpacked.
 */
fn write_asar(out: &Path, unpack_dir: &Path, files: &BTreeMap<PathBuf, Vec<u8>>) -> Result<()> {
    let mut header = json!({ "files": {} });
    let mut data = Vec::new();

    for (path, bytes) in files {
        let unpack = should_unpack(path);
        let entry = if unpack {
            let unpacked_path = unpack_dir.join(path);
            if let Some(parent) = unpacked_path.parent() {
                fs::create_dir_all(parent)?;
            }
            fs::write(&unpacked_path, bytes)?;
            json!({
                "size": bytes.len(),
                "unpacked": true,
                "integrity": integrity_json(bytes),
            })
        } else {
            let offset = data.len();
            data.extend_from_slice(bytes);
            json!({
                "size": bytes.len(),
                "offset": offset.to_string(),
                "integrity": integrity_json(bytes),
            })
        };
        insert_header_entry(&mut header, path, entry)?;
    }

    let mut json_bytes = serde_json::to_vec(&header)?;
    let json_size = json_bytes.len() as u32;
    let aligned_json_size = json_size + (4 - (json_size % 4)) % 4;
    json_bytes.resize(aligned_json_size as usize, 0);

    let mut file = File::create(out)?;
    write_u32(&mut file, 4)?;
    write_u32(&mut file, aligned_json_size + 8)?;
    write_u32(&mut file, aligned_json_size + 4)?;
    write_u32(&mut file, json_size)?;
    file.write_all(&json_bytes)?;
    file.write_all(&data)?;
    file.flush()?;
    Ok(())
}

/*
 * CAVEMAN HEADER TREE.
 *
 * ASAR header is nested JSON dirs.
 * Path parts become nested "files" objects.
 */
fn insert_header_entry(header: &mut Value, path: &Path, entry: Value) -> Result<()> {
    let mut current = header
        .get_mut("files")
        .and_then(Value::as_object_mut)
        .context("bad root header")?;

    let parts: Vec<String> = path_components(path)?;
    for (idx, part) in parts.iter().enumerate() {
        let is_last = idx == parts.len() - 1;
        if is_last {
            current.insert(part.clone(), entry);
            return Ok(());
        }

        let value = current
            .entry(part.clone())
            .or_insert_with(|| json!({ "files": {} }));
        current = value
            .get_mut("files")
            .and_then(Value::as_object_mut)
            .with_context(|| format!("bad directory header at {}", part))?;
    }
    bail!("empty path");
}

/*
 * CAVEMAN PATH.
 *
 * Windows gives backslashes. ASAR wants logical path parts.
 * Normalize. Reject parent traversal.
 */
fn path_components(path: &Path) -> Result<Vec<String>> {
    let text = normalize_asar_path(path);
    let parts: Vec<String> = text
        .split('/')
        .filter(|part| !part.is_empty() && *part != ".")
        .map(ToOwned::to_owned)
        .collect();
    if parts.iter().any(|part| part == "..") {
        bail!("unsupported ASAR path {}", path.display());
    }
    Ok(parts)
}

/*
 * CAVEMAN PATH STRING.
 *
 * One internal path format. Forward slash.
 */
fn normalize_asar_path(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

/*
 * CAVEMAN UNPACK RULE.
 *
 * Native blobs must stay outside ASAR.
 * Electron loads them from app.asar.unpacked.
 */
fn should_unpack(path: &Path) -> bool {
    matches!(
        path.extension().and_then(|s| s.to_str()).map(str::to_ascii_lowercase),
        Some(ext) if ext == "node" || ext == "dll" || ext == "exe"
    )
}

/*
 * CAVEMAN INTEGRITY.
 *
 * ASAR header wants SHA256 hash and 4 MiB block hashes.
 * Stock exe no longer enforces archive hash, but Electron still expects sane metadata.
 */
fn integrity_json(bytes: &[u8]) -> Value {
    let hash = sha256_hex(bytes);
    let blocks: Vec<String> = bytes.chunks(BLOCK_SIZE).map(sha256_hex).collect();
    json!({
        "algorithm": "SHA256",
        "hash": hash,
        "blockSize": BLOCK_SIZE,
        "blocks": blocks,
    })
}

/*
 * CAVEMAN HASH.
 *
 * Bytes in. SHA256 hex out.
 */
fn sha256_hex(bytes: &[u8]) -> String {
    hex::encode(Sha256::digest(bytes))
}

/*
 * CAVEMAN U32.
 *
 * ASAR pickle header writes little-endian u32.
 */
fn write_u32(file: &mut File, value: u32) -> Result<()> {
    file.write_all(&value.to_le_bytes())?;
    Ok(())
}

/*
 * CAVEMAN ANSI.
 *
 * Orange start. Yellow end.
 * Every character gets tiny color step.
 * Cave man terminal look like radioactive sunset.
 */
fn print_banner() -> Result<()> {
    cave_line("")?;
    cave_line("FIXXIN ARTHROPCNPIC CRAUDIO")?;
    cave_line("PRESENT DAY, PRESENT TIME")?;
    cave_line("")?;
    Ok(())
}

fn cave_line(text: &str) -> Result<()> {
    let mut out = io::stdout().lock();
    write_gradient(&mut out, text)?;
    writeln!(out, "\x1b[0m")?;
    Ok(())
}

fn cave_prompt(text: &str) -> Result<()> {
    let mut out = io::stdout().lock();
    write_gradient(&mut out, text)?;
    write!(out, "\x1b[0m")?;
    out.flush()?;
    Ok(())
}

fn write_gradient(out: &mut impl Write, text: &str) -> Result<()> {
    let chars: Vec<char> = text.chars().collect();
    let denom = chars.len().saturating_sub(1).max(1) as f32;
    for (idx, ch) in chars.iter().enumerate() {
        let t = idx as f32 / denom;
        let r = lerp(ORANGE.0, YELLOW.0, t);
        let g = lerp(ORANGE.1, YELLOW.1, t);
        let b = lerp(ORANGE.2, YELLOW.2, t);
        write!(out, "\x1b[38;2;{r};{g};{b}m{ch}")?;
    }
    Ok(())
}

fn lerp(a: u8, b: u8, t: f32) -> u8 {
    (a as f32 + (b as f32 - a as f32) * t).round() as u8
}
