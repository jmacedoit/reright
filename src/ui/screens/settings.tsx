import { styled } from "@linaria/react";
import Ajv, { JSONSchemaType, type ErrorObject } from "ajv";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";
import { AutoField, AutoForm } from "uniforms-unstyled";
import { type UnknownObject } from "uniforms";
import { units } from "../styles/dimensions";
import { providerModels } from "../../services/llm";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { translationKeys } from "../translations";
import type { Settings } from "../../services/settings";
import {
  SelectField,
  ShortcutRecorderField,
  CodeField,
} from "../components/forms";
import { PageContainer } from "../components/containers";
import { SettingsContext } from "../contexts/settings";

/*
 * Styles
 */

const FormsContainer = styled.div``;

const FormRow = styled.div`
  margin-bottom: ${units(3)}px;
`;

/*
 * Schema.
 */

type SettingsFormData = {
  rewriteShortcut: string;
  defaultCommand: string;
  model: {
    modelId: string;
    provider: string;
    apiKey: string;
  };
};

const createSettingsSchema = (
  selectedProvider: string,
  t: TFunction,
  rewritesCommandWords: string[]
): JSONSchemaType<SettingsFormData> => ({
  type: "object",
  properties: {
    rewriteShortcut: {
      type: "string",
      title: t(translationKeys.screens.settings.form.rewriteShortcut.title),
      uniforms: {
        hint: t(translationKeys.screens.settings.form.rewriteShortcut.hint),
        isRecordingLabel: t(
          translationKeys.screens.settings.form.rewriteShortcut
            .startRecordingLabel
        ),
        stopRecordingLabel: t(
          translationKeys.screens.settings.form.rewriteShortcut
            .stopRecordingLabel
        ),
        clearShortcutLabel: t(
          translationKeys.screens.settings.form.rewriteShortcut
            .clearShortcutLabel
        ),
      },
    },
    defaultCommand: {
      type: "string",
      title: t(translationKeys.screens.settings.form.defaultCommand.title),
      enum: rewritesCommandWords,
      uniforms: {
        hint: t(translationKeys.screens.settings.form.defaultCommand.hint),
      },
    },
    model: {
      title: t(translationKeys.screens.settings.form.model.title),
      type: "object",
      properties: {
        provider: {
          type: "string",
          enum: ["openai", "anthropic"],
          title: t(translationKeys.screens.settings.form.model.provider.title),
          uniforms: {
            hint: t(translationKeys.screens.settings.form.model.provider.hint),
          },
        },
        modelId: {
          type: "string",
          enum: providerModels[selectedProvider],
          title: t(translationKeys.screens.settings.form.model.modelId.title),
          uniforms: {
            hint: t(translationKeys.screens.settings.form.model.modelId.hint),
          },
        },
        apiKey: {
          type: "string",
          title: t(translationKeys.screens.settings.form.model.apiKey.title),
          uniforms: {
            placeholder: t(
              translationKeys.screens.settings.form.model.apiKey.placeholder
            ),
            hint: t(translationKeys.screens.settings.form.model.apiKey.hint),
          },
        },
      },
      required: ["provider", "modelId", "apiKey"],
      additionalProperties: false,
    },
  },
  required: ["rewriteShortcut", "defaultCommand", "model"],
  additionalProperties: false,
});

type ValidationResult = { details: ErrorObject[] };

const createValidator = (schema: JSONSchemaType<SettingsFormData>) => {
  const ajv = new Ajv({ allErrors: true, useDefaults: true });

  // Allow Uniforms-specific keyword while keeping AJV strict about the rest.
  ajv.addKeyword("uniforms");

  const validate = ajv.compile(schema);

  return (model: UnknownObject): ValidationResult | null => {
    validate(model);

    const errors = validate.errors ?? [];

    return errors.length ? { details: errors } : null;
  };
};

/*
 * Components.
 */

export function Settings() {
  const { t } = useTranslation();
  const [formModel, setFormModel] = useState<SettingsFormData | null>(null);
  const settingsContext = useContext(SettingsContext);
  const loadedSettings: Settings = settingsContext.settings!;
  const setLoadedSettings = settingsContext.updateSettings;

  useEffect(() => {
    async function load() {
      setFormModel({
        rewriteShortcut: loadedSettings.rewriteShortcut,
        defaultCommand: loadedSettings.defaultCommand,
        model: {
          provider: loadedSettings.model.provider,
          modelId: loadedSettings.model.modelId,
          apiKey: loadedSettings.model.apiKey,
        },
      });
    }

    load();
  }, []);

  const selectedProvider = useMemo(
    () => formModel?.model.provider ?? Object.keys(providerModels)[0],
    [formModel]
  );

  const schema = useMemo(
    () =>
      createSettingsSchema(
        selectedProvider,
        t,
        loadedSettings?.rewrites?.map((rewrite) => rewrite.commandWord) ?? [
          formModel?.defaultCommand ?? "",
        ]
      ),
    [selectedProvider, t, loadedSettings]
  );

  const bridge = useMemo(
    () => new JSONSchemaBridge({ schema, validator: createValidator(schema) }),
    [schema]
  );

  const handleChangeModel = useCallback(
    async (
      nextModel: SettingsFormData,
      _details?: { key: string; value: unknown; previousValue: unknown }
    ) => {
      const allowedModels = providerModels[nextModel.model.provider];

      if (!allowedModels.includes(nextModel.model.modelId)) {
        nextModel = {
          ...nextModel,
          model: {
            ...nextModel.model,
            modelId: allowedModels[0],
          },
        };
      }

      setFormModel(nextModel);

      setLoadedSettings(
        (prev: Settings | null) =>
          ({
            ...(prev ?? {}),
            ...nextModel,
          } as Settings)
      );
    },
    []
  );

  if (!formModel) {
    return <PageContainer />;
  }

  return (
    <PageContainer>
      <h2>{t(translationKeys.screens.settings.title)}</h2>

      <FormsContainer>
        <AutoForm<SettingsFormData>
          model={formModel}
          onChangeModel={handleChangeModel}
          schema={bridge}
        >
          <FormRow>
            <AutoField
              name="rewriteShortcut"
              component={ShortcutRecorderField}
            />
          </FormRow>

          <FormRow>
            <AutoField name="defaultCommand" component={SelectField} />
          </FormRow>

          <FormRow>
            <AutoField name="model.provider" component={SelectField} />
          </FormRow>

          <FormRow>
            <AutoField name="model.modelId" component={SelectField} />
          </FormRow>

          <FormRow>
            <AutoField
              name="model.apiKey"
              component={CodeField}
              autoCapitalize="off"
              autoCorrect="off"
            />
          </FormRow>
        </AutoForm>
      </FormsContainer>
    </PageContainer>
  );
}
