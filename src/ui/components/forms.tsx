import { ReactNode, Ref, useEffect, useState } from "react";
import { SelectFieldProps } from "uniforms-unstyled";
import {
  connectField,
  filterDOMProps,
  type HTMLFieldProps,
  useForm
} from "uniforms";
import { units } from "../styles/dimensions";
import { TrashIcon, WrenchIcon, StopIcon } from "@heroicons/react/24/solid";
import { KeyBindingDisplay } from "./key-binding-display";
import { useShortcutRecorder } from "use-shortcut-recorder";
import { palette } from "../styles/colors";
import { styled } from "@linaria/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { IconButton } from "./buttons";
import color from "color";

/*
 * Types.
 */

type TextFieldProps = HTMLFieldProps<
  string,
  HTMLDivElement,
  {
    inputRef?: Ref<HTMLInputElement>;
    hint?: ReactNode;
  }
>;

type ShortcutRecorderFieldProps = TextFieldProps & {
  isRecordingLabel: string;
  stopRecordingLabel: string;
  clearShortcutLabel: string;
};

type SelectFieldWithHintProps = SelectFieldProps & { hint?: string };
type TextAreaFieldProps = HTMLFieldProps<
  string,
  HTMLDivElement,
  {
    inputRef?: Ref<HTMLTextAreaElement>;
    hint?: ReactNode;
    rows?: number;
  }
>;

/*
 * Styles.
 */

const fieldBaseStyles = `
  all: unset;
  min-width: ${units(22)}px;
  padding: ${units(1)}px;
  display: inline-block;
  background-color: ${palette.veryLightGrey};
  border-radius: ${units(3)}px;
  border: 2px solid transparent;
  box-sizing: border-box;
  min-height: ${units(4)}px;

  &:focus {
    border: 2px solid grey;
  }
`;

const FakeInput = styled.div`
  ${fieldBaseStyles}
`;

const StyledInput = styled.input`
  ${fieldBaseStyles}
`;

const StyledTextarea = styled.textarea`
  ${fieldBaseStyles}

  border-radius: ${units(1)}px;
  min-height: ${units(10)}px;
  resize: vertical;
  width: 100%;
`;

const ErrorsContainer = styled.div`
  margin-top: ${units(1.5)}px;
  padding: ${units(1)}px ${units(1.5)}px;
  border-radius: ${units(1)}px;
  background-color: ${color(palette.red).lighten(0.6).toString()};
`;

const ErrorsList = styled.ul`
  margin: 0;
  padding-left: ${units(2)}px;
  color: ${palette.red};
  list-style: disc;
  display: grid;
  gap: ${units(0.5)}px;
`;

const SelectWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const StyledSelect = styled.select`
  ${fieldBaseStyles}
  appearance: none;
  padding-right: ${units(6)}px;
`;

const SelectChevron = styled(ChevronDownIcon)`
  position: absolute;
  right: ${units(1.5)}px;
  width: ${units(1.5)}px;
  height: ${units(1.5)}px;
  pointer-events: none;
`;

const FieldLabel = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5em;
`;

const Hint = styled.small`
  color: ${palette.mediumGrey};

  code {
    background-color: ${palette.butterYellow};
    font-family: monospace;
  }
`;

const LabelHintContainer = styled.div`
  padding-right: ${units(2)}px;
`;

/*
 * Components.
 */

export const ShortcutRecorderField = connectField<ShortcutRecorderFieldProps>(
  function ShortcutRecorderFieldComponent({
    id,
    label,
    onChange,
    hint,
    value,
    isRecordingLabel,
    stopRecordingLabel,
    clearShortcutLabel,
    // Extracted to prevent passing to DOM via ...props
    autoComplete: _autoComplete,
    disabled: _disabled,
    inputRef: _inputRef,
    name: _name,
    placeholder: _placeholder,
    readOnly: _readOnly,
    type: _type = "text",
    ...props
  }: ShortcutRecorderFieldProps) {
    const replaceMetaAndSuperKeys = (shortcut: string) => {
      return shortcut.replace("Meta", "CommandOrControl");
    };

    const [pendingShortcut, setPendingShortcut] = useState<string | null>(null);

    const { isRecording, startRecording, stopRecording } = useShortcutRecorder({
      onChange: (newShortcut) => {
        setPendingShortcut(replaceMetaAndSuperKeys(newShortcut.join("+")));
      },
      excludedKeys: [],
      excludedShortcuts: [],
      excludedModKeys: [],
      maxModKeys: 3,
      minModKeys: 1
    });

    useEffect(() => {
      if (pendingShortcut !== null) {
        onChange(pendingShortcut);
      }
    }, [pendingShortcut, onChange]);

    return (
      <div
        style={{ display: "flex", flexDirection: "row" }}
        {...filterDOMProps(props)}
      >
        <LabelHintContainer>
          {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}

          <Hint>{hint}</Hint>
        </LabelHintContainer>

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: units(1)
          }}
        >
          <IconButton
            onClick={() => onChange("")}
            aria-label={clearShortcutLabel}
            title={clearShortcutLabel}
          >
            <TrashIcon />
          </IconButton>

          <IconButton
            onClick={() => {
              if (isRecording) {
                stopRecording();
              } else {
                startRecording();
              }
            }}
            aria-label={isRecording ? stopRecordingLabel : isRecordingLabel}
            title={isRecording ? stopRecordingLabel : isRecordingLabel}
          >
            {isRecording ? <StopIcon color={palette.red} /> : <WrenchIcon />}
          </IconButton>

          <FakeInput>
            {value ? <KeyBindingDisplay keys={value} /> : ""}
          </FakeInput>
        </div>
      </div>
    );
  },
  { kind: "leaf" }
);

export const TextField = connectField<TextFieldProps>(
  function TextFieldComponent({
    autoComplete,
    autoCapitalize,
    autoCorrect,
    disabled,
    id,
    inputRef,
    label,
    name,
    onChange,
    placeholder,
    readOnly,
    hint,
    type = "text",
    value,
    ...props
  }: TextFieldProps) {
    return (
      <div
        style={{ display: "flex", flexDirection: "row" }}
        {...filterDOMProps(props)}
      >
        <LabelHintContainer>
          {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}

          <Hint>{hint}</Hint>
        </LabelHintContainer>

        <div style={{ flex: 1 }} />

        <div>
          <StyledInput
            autoComplete={autoComplete}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            disabled={disabled}
            id={id}
            name={name}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            ref={inputRef}
            type={type}
            value={value ?? ""}
          />
        </div>
      </div>
    );
  },
  { kind: "leaf" }
);

export const SelectField = connectField<SelectFieldWithHintProps>(
  function SelectFieldComponent({
    disabled,
    id,
    inputRef,
    label,
    name,
    onChange,
    placeholder,
    readOnly,
    required,
    value,
    options,
    hint,
    ...props
  }: SelectFieldWithHintProps) {
    const normalizedOptions = options ?? [];

    return (
      <div
        style={{ display: "flex", flexDirection: "row" }}
        {...filterDOMProps(props)}
      >
        <LabelHintContainer>
          {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}

          <Hint>{hint}</Hint>
        </LabelHintContainer>

        <div style={{ flex: 1 }} />

        <SelectWrapper>
          <StyledSelect
            disabled={disabled}
            id={id}
            name={name}
            onChange={(event) => {
              if (!readOnly) {
                const next = event.target.value;
                onChange(next !== "" ? next : undefined);
              }
            }}
            ref={inputRef}
            required={required}
            value={value ?? ""}
          >
            {(!required || value === undefined) && (
              <option value="" disabled={required} hidden={required}>
                {placeholder || label}
              </option>
            )}

            {normalizedOptions?.map((option) => (
              <option
                key={option.key ?? option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label ?? option.value}
              </option>
            ))}
          </StyledSelect>

          <SelectChevron aria-hidden />
        </SelectWrapper>
      </div>
    );
  },
  { kind: "leaf" }
);

export const TextAreaField = connectField<TextAreaFieldProps>(
  function TextAreaFieldComponent({
    autoComplete,
    disabled,
    id,
    inputRef,
    label,
    name,
    onChange,
    placeholder,
    readOnly,
    hint,
    value,
    rows = 4,
    ...props
  }: TextAreaFieldProps) {
    return (
      <div {...filterDOMProps(props)}>
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}

        {hint && <Hint>{hint}</Hint>}

        <StyledTextarea
          autoComplete={autoComplete}
          disabled={disabled}
          id={id}
          name={name}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          ref={inputRef}
          value={value ?? ""}
          rows={rows}
        />
      </div>
    );
  },
  { kind: "leaf" }
);

export const CodeField = styled(TextField)`
  input {
    font-family: monospace;
  }
`;

export function Errors() {
  const { error } = useForm();

  const details =
    (error as { details?: Array<{ message?: string }> } | undefined)?.details ??
    [];

  if (!details.length) {
    return null;
  }

  return (
    <ErrorsContainer>
      <ErrorsList>
        {details.map((detail, index) => (
          <li key={index}>{detail.message ?? "Unknown error"}</li>
        ))}
      </ErrorsList>
    </ErrorsContainer>
  );
}
