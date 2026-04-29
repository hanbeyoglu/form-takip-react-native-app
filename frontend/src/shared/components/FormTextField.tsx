import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { TextInput, TextInputProps } from "react-native";

import { TextField } from "./TextField";

type FormTextFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "numeric" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  inputRef?: React.RefObject<TextInput>;
} & Pick<
  TextInputProps,
  | "autoComplete"
  | "autoCorrect"
  | "autoFocus"
  | "blurOnSubmit"
  | "inputAccessoryViewID"
  | "onSubmitEditing"
  | "returnKeyType"
  | "selectTextOnFocus"
  | "textContentType"
>;

export function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  helperText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  inputRef,
  autoComplete,
  autoCorrect,
  autoFocus,
  blurOnSubmit,
  inputAccessoryViewID,
  onSubmitEditing,
  returnKeyType,
  selectTextOnFocus,
  textContentType
}: FormTextFieldProps<T>): React.JSX.Element {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <TextField
          label={label}
          placeholder={placeholder}
          helperText={helperText}
          value={String(value ?? "")}
          onChangeText={onChange}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          inputRef={inputRef}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          autoFocus={autoFocus}
          blurOnSubmit={blurOnSubmit}
          inputAccessoryViewID={inputAccessoryViewID}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          selectTextOnFocus={selectTextOnFocus}
          textContentType={textContentType}
          errorMessage={error?.message}
        />
      )}
    />
  );
}
