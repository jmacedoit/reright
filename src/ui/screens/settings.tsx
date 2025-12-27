import { styled } from "@linaria/react";
import Ajv, { JSONSchemaType, type ErrorObject } from "ajv";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";
import { AutoField, AutoForm } from "uniforms-unstyled";
import { type UnknownObject } from "uniforms";
import { units } from "../styles/dimensions";
import { providerModels, recommendedModels } from "../../services/llm";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { translationKeys } from "../translations";
import type { Settings } from "../../services/settings";
import {
  SelectField,
  ShortcutRecorderField,
  CodeField,
  SwitchField
} from "../components/forms";
import { PageContainer } from "../components/containers";
import { SettingsContext } from "../contexts/settings";
import {
  ergonomicRequirementsService,
  ErgonomicCapabilities
} from "../../services/ergonomic-requirements";
import {
  ModalContainer,
  ModalContent,
  ModalActions
} from "../components/modal";
import { NormalButton } from "../components/buttons";

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
  autostart: boolean;
  ergonomicMode: boolean;
};

const createSettingsSchema = (
  selectedProvider: string,
  t: TFunction,
  rewritesCommandWords: string[],
  allowedProviders: string[],
  ergonomicModeHint: string
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
        )
      }
    },
    defaultCommand: {
      type: "string",
      title: t(translationKeys.screens.settings.form.defaultCommand.title),
      enum: rewritesCommandWords,
      uniforms: {
        hint: t(translationKeys.screens.settings.form.defaultCommand.hint)
      }
    },
    model: {
      title: t(translationKeys.screens.settings.form.model.title),
      type: "object",
      properties: {
        provider: {
          type: "string",
          enum: allowedProviders,
          title: t(translationKeys.screens.settings.form.model.provider.title),
          uniforms: {
            hint: t(translationKeys.screens.settings.form.model.provider.hint)
          }
        },
        modelId: {
          type: "string",
          enum: providerModels[selectedProvider],
          title: t(translationKeys.screens.settings.form.model.modelId.title),
          uniforms: {
            hint: t(translationKeys.screens.settings.form.model.modelId.hint),
            options: providerModels[selectedProvider].map((model) => ({
              label: `${model}${
                recommendedModels.includes(model) ? " ⚡" : ""
              }`,
              value: model
            }))
          }
        },
        apiKey: {
          type: "string",
          title: t(translationKeys.screens.settings.form.model.apiKey.title),
          uniforms: {
            placeholder: t(
              translationKeys.screens.settings.form.model.apiKey.placeholder
            ),
            hint: t(translationKeys.screens.settings.form.model.apiKey.hint)
          }
        }
      },
      required: ["provider", "modelId", "apiKey"],
      additionalProperties: false
    },
    autostart: {
      type: "boolean",
      title: t(translationKeys.screens.settings.form.autostart.title),
      uniforms: {
        hint: t(translationKeys.screens.settings.form.autostart.hint)
      }
    },
    ergonomicMode: {
      type: "boolean",
      title: t(translationKeys.screens.settings.form.ergonomicMode.title),
      uniforms: {
        hint: ergonomicModeHint
      }
    }
  },
  required: ["rewriteShortcut", "defaultCommand", "model"],
  additionalProperties: false
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

  // Ergonomic mode state
  const [ergonomicCapabilities, setErgonomicCapabilities] =
    useState<ErgonomicCapabilities | null>(null);
  const [hasErgonomicPermissions, setHasErgonomicPermissions] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  // Load ergonomic capabilities and permissions on mount
  useEffect(() => {
    async function loadErgonomicState() {
      const capabilities = await ergonomicRequirementsService.getCapabilities();
      setErgonomicCapabilities(capabilities);

      if (capabilities.requiresPermissions) {
        const permissions =
          await ergonomicRequirementsService.checkPermissions();
        setHasErgonomicPermissions(permissions);
      } else {
        // No permissions required means we have them
        setHasErgonomicPermissions(true);
      }
    }

    loadErgonomicState();
  }, []);

  useEffect(() => {
    async function load() {
      setFormModel({
        rewriteShortcut: loadedSettings.rewriteShortcut,
        defaultCommand: loadedSettings.defaultCommand,
        model: {
          provider: loadedSettings.model.provider,
          modelId: loadedSettings.model.modelId,
          apiKey: loadedSettings.model.apiKey
        },
        autostart: loadedSettings.autostart,
        ergonomicMode: loadedSettings.ergonomicMode
      });
    }

    load();
  }, []);

  const selectedProvider = useMemo(
    () => formModel?.model.provider ?? Object.keys(providerModels)[0],
    [formModel]
  );

  const showErgonomicToggle = ergonomicCapabilities?.platformSupported ?? false;

  const schema = useMemo(
    () =>
      createSettingsSchema(
        selectedProvider,
        t,
        loadedSettings?.rewrites?.map((rewrite) => rewrite.commandWord) ?? [
          formModel?.defaultCommand ?? ""
        ],
        Object.keys(providerModels),
        t(translationKeys.screens.settings.form.ergonomicMode.hint)
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
            modelId: allowedModels[0]
          }
        };
      }

      // Handle ergonomic mode toggle - check permissions before enabling
      const isEnablingErgonomicMode =
        nextModel.ergonomicMode && !formModel?.ergonomicMode;

      if (isEnablingErgonomicMode) {
        const capabilities =
          ergonomicCapabilities ??
          (await ergonomicRequirementsService.getCapabilities());

        if (capabilities.requiresPermissions && !hasErgonomicPermissions) {
          // Show permissions modal and don't enable the setting
          setShowPermissionsModal(true);

          // Revert the ergonomic mode change
          nextModel = {
            ...nextModel,
            ergonomicMode: false
          };
        }
      }

      setFormModel(nextModel);

      setLoadedSettings(
        (prev: Settings | null) =>
          ({
            ...(prev ?? {}),
            ...nextModel
          }) as Settings
      );
    },
    [formModel, ergonomicCapabilities, hasErgonomicPermissions]
  );

  const handleRequestPermissions = useCallback(async () => {
    await ergonomicRequirementsService.requestPermissions();
    setShowPermissionsModal(false);
  }, []);

  const handleClosePermissionsModal = useCallback(() => {
    setShowPermissionsModal(false);
  }, []);

  if (!formModel) {
    return <PageContainer />;
  }

  return (
    <PageContainer>
      <h2>{t(translationKeys.screens.settings.title)}</h2>

      <ModalContainer
        id="permissions-modal"
        isOpen={showPermissionsModal}
        onRequestClose={handleClosePermissionsModal}
      >
        <ModalContent
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <h2>
            {t(
              translationKeys.screens.settings.form.ergonomicMode
                .permissionsRequired
            )}
          </h2>
          <p>
            {t(
              translationKeys.screens.settings.form.ergonomicMode
                .permissionsMessage
            )}
          </p>
          <ModalActions>
            <NormalButton onClick={handleClosePermissionsModal}>
              {t(translationKeys.update.laterButton)}
            </NormalButton>
            <NormalButton onClick={handleRequestPermissions}>
              {t(
                translationKeys.screens.settings.form.ergonomicMode
                  .permissionsButton
              )}
            </NormalButton>
          </ModalActions>
        </ModalContent>
      </ModalContainer>

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

          <FormRow>
            <AutoField name="autostart" component={SwitchField} />
          </FormRow>

          {showErgonomicToggle && (
            <FormRow>
              <AutoField name="ergonomicMode" component={SwitchField} />
            </FormRow>
          )}
        </AutoForm>
      </FormsContainer>
    </PageContainer>
  );
}
