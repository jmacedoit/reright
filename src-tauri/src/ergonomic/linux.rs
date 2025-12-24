// Linux implementation - stub for future

pub fn check_permissions() -> bool {
    false
}

pub fn request_permissions() -> bool {
    false
}

pub fn simulate_copy() -> Result<(), String> {
    Err("Linux support not yet implemented".to_string())
}

pub fn simulate_paste() -> Result<(), String> {
    Err("Linux support not yet implemented".to_string())
}
