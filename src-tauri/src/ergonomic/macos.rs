use core_foundation::base::TCFType;
use core_foundation::boolean::CFBoolean;
use core_foundation::dictionary::CFDictionary;
use core_foundation::string::CFString;

pub fn check_permissions() -> bool {
    unsafe {
        // AXIsProcessTrusted() returns true if the app has accessibility permissions
        AXIsProcessTrusted()
    }
}

/// Request accessibility permissions - shows native macOS dialog and opens System Settings
/// Returns true if the dialog was shown (not whether permissions were granted)
pub fn request_permissions() -> bool {
    unsafe {
        // Create options dictionary with kAXTrustedCheckOptionPrompt = true
        // This will show the native dialog and open System Settings
        let key = CFString::new("AXTrustedCheckOptionPrompt");
        let value = CFBoolean::true_value();

        let options = CFDictionary::from_CFType_pairs(&[(key.as_CFType(), value.as_CFType())]);

        // This call shows the dialog if not trusted
        AXIsProcessTrustedWithOptions(options.as_concrete_TypeRef());

        // Return true to indicate dialog was shown
        true
    }
}

pub fn simulate_copy() -> Result<(), String> {
    simulate_key_with_command(0x08) // 'c' key
}

pub fn simulate_paste() -> Result<(), String> {
    simulate_key_with_command(0x09) // 'v' key
}

fn simulate_key_with_command(key_code: u16) -> Result<(), String> {
    unsafe {
        let source = CGEventSourceCreate(CGEventSourceStateID::HIDSystemState);
        if source.is_null() {
            return Err("Failed to create event source".to_string());
        }

        // Key down with Command modifier
        let key_down = CGEventCreateKeyboardEvent(source, key_code, true);
        if key_down.is_null() {
            CFRelease(source as *const _);
            return Err("Failed to create key down event".to_string());
        }
        CGEventSetFlags(key_down, CGEventFlags::CGEventFlagMaskCommand);
        CGEventPost(CGEventTapLocation::CGHIDEventTap, key_down);

        // Key up with Command modifier
        let key_up = CGEventCreateKeyboardEvent(source, key_code, false);
        if key_up.is_null() {
            CFRelease(key_down as *const _);
            CFRelease(source as *const _);
            return Err("Failed to create key up event".to_string());
        }
        CGEventSetFlags(key_up, CGEventFlags::CGEventFlagMaskCommand);
        CGEventPost(CGEventTapLocation::CGHIDEventTap, key_up);

        // Clean up
        CFRelease(key_up as *const _);
        CFRelease(key_down as *const _);
        CFRelease(source as *const _);

        Ok(())
    }
}

#[link(name = "ApplicationServices", kind = "framework")]
extern "C" {
    fn AXIsProcessTrusted() -> bool;
    fn AXIsProcessTrustedWithOptions(options: core_foundation::dictionary::CFDictionaryRef)
        -> bool;
}

#[link(name = "CoreGraphics", kind = "framework")]
extern "C" {
    fn CGEventSourceCreate(stateID: CGEventSourceStateID) -> CGEventSourceRef;
    fn CGEventCreateKeyboardEvent(
        source: CGEventSourceRef,
        virtualKey: u16,
        keyDown: bool,
    ) -> CGEventRef;
    fn CGEventSetFlags(event: CGEventRef, flags: CGEventFlags);
    fn CGEventPost(tap: CGEventTapLocation, event: CGEventRef);
}

#[link(name = "CoreFoundation", kind = "framework")]
extern "C" {
    fn CFRelease(cf: *const core::ffi::c_void);
}

// Type definitions
type CGEventSourceRef = *mut core::ffi::c_void;
type CGEventRef = *mut core::ffi::c_void;

#[repr(u32)]
#[derive(Clone, Copy)]
enum CGEventSourceStateID {
    HIDSystemState = 1,
}

#[repr(u32)]
#[derive(Clone, Copy)]
enum CGEventTapLocation {
    CGHIDEventTap = 0,
}

#[repr(u64)]
#[derive(Clone, Copy)]
enum CGEventFlags {
    CGEventFlagMaskCommand = 0x00100000,
}
