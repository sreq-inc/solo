use std::process::Command;
use std::fs;
use std::path::Path;
use std::io::{self, Write};

fn main() -> io::Result<()> {
    // Ask the user for the version name
    print!("Enter release version (e.g. v1.0.0): ");
    io::stdout().flush()?; // make sure the prompt is printed

    let mut version = String::new();
    io::stdin().read_line(&mut version)?;
    let version = version.trim(); // remove newline and whitespace

    if version.is_empty() {
        eprintln!("Error: version name cannot be empty.");
        std::process::exit(1);
    }

    // Run "bun tauri build"
    println!("Running: bun tauri build");
    let status = Command::new("bun")
        .args(["tauri", "build"])
        .status()
        .expect("Failed to run 'bun tauri build'");

    if !status.success() {
        eprintln!("Error: 'bun tauri build' failed.");
        std::process::exit(1);
    }

    // Paths
    let source = Path::new("src-tauri/target/release/bundle");
    let destination = Path::new("releases").join(version);

    // Create versioned releases folder
    if destination.exists() {
        eprintln!("Warning: destination folder {} already exists.", destination.display());
    } else {
        fs::create_dir_all(&destination)?;
    }

    // Copy files
    copy_dir_all(&source, &destination)?;

    println!("Build completed. Files copied to: {}", destination.display());
    Ok(())
}

/// Recursively copy all contents of a folder
fn copy_dir_all(src: &Path, dst: &Path) -> io::Result<()> {
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if file_type.is_dir() {
            fs::create_dir_all(&dst_path)?;
            copy_dir_all(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)?;
        }
    }
    Ok(())
}
