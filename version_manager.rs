use regex::Regex;
use std::fs;
use std::io::{self, Write};
use std::process::Command;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🔍 Version Manager - Solo");
    println!("=========================\n");

    // File paths
    let package_json_path = "package.json";
    let cargo_toml_path = "src-tauri/Cargo.toml";
    let tauri_conf_path = "src-tauri/tauri.conf.json";

    // Read current version
    let current_version = get_current_version(package_json_path)?;
    println!("📦 Current version: {}\n", current_version);

    // Ask for new version
    print!("✏️  Enter the new version (e.g., 0.0.17): ");
    io::stdout().flush()?;

    let mut new_version = String::new();
    io::stdin().read_line(&mut new_version)?;
    let new_version = new_version.trim();

    // Validate version format
    if !is_valid_version(new_version) {
        eprintln!("❌ Error: Invalid version format! Use format: X.Y.Z");
        std::process::exit(1);
    }

    println!(
        "\n🔄 Updating version from {} to {}...\n",
        current_version, new_version
    );

    // Update files
    update_package_json(package_json_path, &current_version, new_version)?;
    println!("✅ Updated: {}", package_json_path);

    update_cargo_toml(cargo_toml_path, &current_version, new_version)?;
    println!("✅ Updated: {}", cargo_toml_path);

    update_tauri_conf(tauri_conf_path, &current_version, new_version)?;
    println!("✅ Updated: {}", tauri_conf_path);

    // Create commit
    println!("\n📝 Creating commit...");
    create_commit(new_version)?;

    println!("\n🎉 Version successfully updated to {}!", new_version);
    println!("📌 Commit created: chore: bump version to {}", new_version);

    Ok(())
}

fn get_current_version(package_json_path: &str) -> Result<String, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(package_json_path)?;
    let re = Regex::new(r#""version":\s*"([^"]+)""#)?;

    if let Some(caps) = re.captures(&content) {
        Ok(caps[1].to_string())
    } else {
        Err("Could not find version in package.json".into())
    }
}

fn is_valid_version(version: &str) -> bool {
    let re = Regex::new(r"^\d+\.\d+\.\d+$").unwrap();
    re.is_match(version)
}

fn update_package_json(
    path: &str,
    old_version: &str,
    new_version: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let content = fs::read_to_string(path)?;
    let pattern = format!(r#""version": "{}""#, old_version);
    let replacement = format!(r#""version": "{}""#, new_version);
    let updated = content.replace(&pattern, &replacement);
    fs::write(path, updated)?;
    Ok(())
}

fn update_cargo_toml(
    path: &str,
    old_version: &str,
    new_version: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let content = fs::read_to_string(path)?;
    let pattern = format!(r#"version = "{}""#, old_version);
    let replacement = format!(r#"version = "{}""#, new_version);
    let updated = content.replace(&pattern, &replacement);
    fs::write(path, updated)?;
    Ok(())
}

fn update_tauri_conf(
    path: &str,
    old_version: &str,
    new_version: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let content = fs::read_to_string(path)?;
    let pattern = format!(r#""version": "{}""#, old_version);
    let replacement = format!(r#""version": "{}""#, new_version);
    let updated = content.replace(&pattern, &replacement);
    fs::write(path, updated)?;
    Ok(())
}

fn create_commit(version: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Add modified files
    let status = Command::new("git")
        .args(&[
            "add",
            "package.json",
            "src-tauri/Cargo.toml",
            "src-tauri/tauri.conf.json",
        ])
        .status()?;

    if !status.success() {
        return Err("Error adding files to git".into());
    }

    // Create commit
    let commit_message = format!("chore: bump version to {}", version);
    let status = Command::new("git")
        .args(&["commit", "-m", &commit_message])
        .status()?;

    if !status.success() {
        return Err("Error creating commit".into());
    }

    Ok(())
}
