fn main() {
    println!("cargo:rerun-if-changed=tools/build-theme-payload.mjs");
    println!("cargo:rerun-if-changed=src-ui/header.txt");
    println!("cargo:rerun-if-changed=src-ui/panel.css");
    println!("cargo:rerun-if-changed=src-ui/parts/01-state.js");
    println!("cargo:rerun-if-changed=src-ui/parts/02-colors.js");
    println!("cargo:rerun-if-changed=src-ui/parts/03-claude-css.js");
    println!("cargo:rerun-if-changed=src-ui/parts/04-live.js");
    println!("cargo:rerun-if-changed=src-ui/parts/05-panel.js");
    println!("cargo:rerun-if-changed=src-ui/parts/06-pill.js");

    println!("cargo:rerun-if-env-changed=NODE_EXE");
    let node = std::env::var_os("NODE_EXE").unwrap_or_else(|| "node".into());
    let status = std::process::Command::new(&node)
        .arg("tools/build-theme-payload.mjs")
        .status()
        .expect(
            "failed to run Node.js; install Node.js, set NODE_EXE, or run tools/build-theme-payload.mjs manually",
        );
    if !status.success() {
        panic!("theme payload build failed");
    }

    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("windows") {
        let mut res = winresource::WindowsResource::new();
        res.set_icon("craude.ico");
        res.compile().expect("failed to compile Windows resources");
    }
}
