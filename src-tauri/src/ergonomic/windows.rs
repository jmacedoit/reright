use std::mem::size_of;
use std::thread;
use std::time::Duration;
use windows::Win32::UI::Input::KeyboardAndMouse::{
    MapVirtualKeyW, SendInput, INPUT, INPUT_0, INPUT_KEYBOARD, KEYBDINPUT, KEYBD_EVENT_FLAGS,
    KEYEVENTF_KEYUP, MAPVK_VK_TO_VSC, VIRTUAL_KEY,
};

// Virtual key codes
const VK_CONTROL: u16 = 0x11;
const VK_C: u16 = 0x43;
const VK_V: u16 = 0x56;

pub fn check_permissions() -> bool {
    true
}

pub fn request_permissions() -> bool {
    true
}

pub fn simulate_copy() -> Result<(), String> {
    simulate_key_with_ctrl(VK_C)
}

pub fn simulate_paste() -> Result<(), String> {
    simulate_key_with_ctrl(VK_V)
}

fn simulate_key_with_ctrl(key_code: u16) -> Result<(), String> {
    // Small delay to ensure previous keys are released
    thread::sleep(Duration::from_millis(10));

    // Press Ctrl
    send_key_event(VK_CONTROL, false)?;
    thread::sleep(Duration::from_millis(10));

    // Press key
    send_key_event(key_code, false)?;
    thread::sleep(Duration::from_millis(10));

    // Release key
    send_key_event(key_code, true)?;
    thread::sleep(Duration::from_millis(10));

    // Release Ctrl
    send_key_event(VK_CONTROL, true)?;

    Ok(())
}

fn send_key_event(key_code: u16, key_up: bool) -> Result<(), String> {
    // Get scan code for better compatibility with some applications
    let scan_code = unsafe { MapVirtualKeyW(key_code as u32, MAPVK_VK_TO_VSC) as u16 };

    let flags = if key_up {
        KEYEVENTF_KEYUP
    } else {
        KEYBD_EVENT_FLAGS::default()
    };

    let input = INPUT {
        r#type: INPUT_KEYBOARD,
        Anonymous: INPUT_0 {
            ki: KEYBDINPUT {
                wVk: VIRTUAL_KEY(key_code),
                wScan: scan_code,
                dwFlags: flags,
                time: 0,
                dwExtraInfo: 0,
            },
        },
    };

    let result = unsafe { SendInput(&[input], size_of::<INPUT>() as i32) };

    if result != 1 {
        return Err("SendInput failed".to_string());
    }

    Ok(())
}
