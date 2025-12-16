import { Trans, useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useCallback, useContext, useMemo, useState } from "react";
import { PageContainer } from "../components/containers";
import { Settings } from "../../services/settings";
import { IconButton, NormalButton } from "../components/buttons";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { styled } from "@linaria/react";
import { units } from "../styles/dimensions";
import { commandPalette, palette } from "../styles/colors";
import {
  ModalActions,
  ModalBody,
  ModalContainer,
  ModalContent,
} from "../components/modal";
import Ajv, { type ErrorObject, type JSONSchemaType } from "ajv";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";
import { AutoField, AutoForm } from "uniforms-unstyled";
import { type UnknownObject } from "uniforms";
import {
  CodeField,
  Errors,
  TextAreaField,
  TextField,
} from "../components/forms";
import { isEmpty, trim } from "lodash";
import { Rewrite } from "../../types/general";
import { translationKeys } from "../translations";
import { SettingsContext } from "../contexts/settings";

/*
 * Styles.
 */

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${units(3)}px;

  td {
    font-size: 0.875rem;
  }

  th,
  td {
    padding-top: ${units(1)}px;
    padding-bottom: ${units(1)}px;

    text-align: left;
  }

  th:not(:first-child),
  td:not(:first-child) {
    padding-left: ${units(2)}px;
  }

  tr:not(:last-child) > td {
    border-bottom: 1px solid ${palette.veryLightGrey};
  }
`;

const CellContainer = styled.div`
  display: inline-flex;
  align-items: center;
`;

const CommandChip = styled.div<{ backgroundColor: string }>`
  display: inline-block;
  padding: ${units(0.5)}px ${units(1)}px;
  border-radius: ${units(5)}px;
  font-family: monospace;
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

const FormRow = styled.div`
  margin-bottom: ${units(2)}px;
`;

/*
 * Types and schema.
 */

type RewriteFormData = {
  name: string;
  commandWord: string;
  instructions: string;
};

type ValidationResult = { details: ErrorObject[] };

const createRewriteSchema = (
  t: TFunction
): JSONSchemaType<RewriteFormData> => ({
  type: "object",
  properties: {
    name: {
      type: "string",
      title: t(translationKeys.screens.rewrites.form.name.title),
      minLength: 1,
      uniforms: {
        hint: t(translationKeys.screens.rewrites.form.name.hint),
      },
      maxLength: 32,
    },
    commandWord: {
      type: "string",
      title: t(translationKeys.screens.rewrites.form.commandWord.title),
      minLength: 1,
      maxLength: 32,
    },
    instructions: {
      type: "string",
      title: t(translationKeys.screens.rewrites.form.instructions.title),
      minLength: 1,
      uniforms: {
        hint: t(translationKeys.screens.rewrites.form.instructions.hint),
      },
      maxLength: 2048,
    },
  },
  required: ["name", "commandWord", "instructions"],
  additionalProperties: false,
});

const createValidator = (
  schema: JSONSchemaType<RewriteFormData>,
  existingCommandWords: string[],
  allowedCommandWord: string | undefined,
  duplicateCommandMessage: string
) => {
  const ajv = new Ajv({ allErrors: true, useDefaults: true });
  ajv.addKeyword("uniforms");

  const validate = ajv.compile(schema);

  return (model: UnknownObject): ValidationResult | null => {
    validate(model);

    const errors = validate.errors ?? [];

    if (
      typeof model?.commandWord === "string" &&
      existingCommandWords
        .map((command) => command.toLowerCase())
        .includes(model.commandWord.toLowerCase().trim()) &&
      model.commandWord.toLowerCase().trim() !==
        (allowedCommandWord ?? "").toLowerCase().trim()
    ) {
      errors.push({
        instancePath: "/commandWord",
        schemaPath: "#/properties/commandWord",
        keyword: "uniqueCommandWord",
        params: {},
        message: duplicateCommandMessage,
      } as ErrorObject);
    }

    return errors.length ? { details: errors } : null;
  };
};

const emptyRewriteFormModel: RewriteFormData = {
  name: "",
  commandWord: "",
  instructions: "",
};
/*
 * Components.
 */

export function Rewrites() {
  const { t } = useTranslation();
  const settingsContext = useContext(SettingsContext);
  const loadedSettings: Settings = settingsContext.settings!;
  const setLoadedSettings = settingsContext.updateSettings;
  const [isEditAddModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rewriteFormModel, setRewriteFormModel] = useState<RewriteFormData>(
    emptyRewriteFormModel
  );
  const [editingRewrite, setEditingRewrite] = useState<Rewrite | null>(null);
  const [rewritePendingDeletion, setRewritePendingDeletion] =
    useState<Rewrite | null>(null);
  const [formKey, setFormKey] = useState(0);
  const isFormComplete = useMemo(() => {
    return (
      trim(rewriteFormModel.name).length > 0 &&
      trim(rewriteFormModel.commandWord).length > 0 &&
      trim(rewriteFormModel.instructions).length > 0
    );
  }, [rewriteFormModel]);
  const rewrites = useMemo(
    () => loadedSettings?.rewrites ?? [],
    [loadedSettings]
  );
  const closeEditAddModal = useCallback(() => {
    setRewriteFormModel(emptyRewriteFormModel);
    setEditingRewrite(null);
    setIsModalOpen(false);
  }, []);
  const closeDeleteModal = useCallback(() => {
    setRewritePendingDeletion(null);
    setIsDeleteModalOpen(false);
  }, []);
  const openModal = useCallback(() => {
    setRewriteFormModel(emptyRewriteFormModel);
    setFormKey((prev) => prev + 1);
    setIsModalOpen(true);
  }, []);
  const openDeleteModal = useCallback((rewrite: Rewrite) => {
    setRewritePendingDeletion(rewrite);
    setIsDeleteModalOpen(true);
  }, []);
  const afterOpenEditAddModal = () => {};
  const existingCommandWords = useMemo(
    () => rewrites.map((rewrite) => rewrite.commandWord),
    [rewrites]
  );
  const rewriteSchema = useMemo(() => createRewriteSchema(t), [t]);
  const rewriteValidator = useMemo(
    () =>
      createValidator(
        rewriteSchema,
        existingCommandWords,
        editingRewrite?.commandWord,
        t(translationKeys.screens.rewrites.form.commandWord.uniqueError)
      ),
    [rewriteSchema, existingCommandWords, editingRewrite?.commandWord, t]
  );
  const rewriteBridge = useMemo(
    () =>
      new JSONSchemaBridge({
        schema: rewriteSchema,
        validator: rewriteValidator,
      }),
    [rewriteSchema, rewriteValidator]
  );

  const handleValidateRewriteForm = useCallback(
    (model: UnknownObject) => rewriteValidator(model),
    [rewriteValidator]
  );

  const handleChangeRewriteModel = useCallback((nextModel: RewriteFormData) => {
    setRewriteFormModel(nextModel);
  }, []);

  const handleSubmitRewrite = useCallback(
    (nextRewrite: RewriteFormData) => {
      setLoadedSettings((prev) => {
        if (!prev) return prev;

        if (editingRewrite) {
          const updatedRewrite: Rewrite = {
            name: trim(nextRewrite.name),
            commandWord: trim(nextRewrite.commandWord),
            instructions: trim(nextRewrite.instructions),
          };

          const rewrites = prev.rewrites.map((rewrite) =>
            rewrite.commandWord === editingRewrite.commandWord
              ? updatedRewrite
              : rewrite
          );

          const defaultCommand =
            prev.defaultCommand === editingRewrite.commandWord
              ? updatedRewrite.commandWord
              : prev.defaultCommand;

          return {
            ...prev,
            rewrites,
            defaultCommand,
          };
        }

        return {
          ...prev,
          rewrites: [
            ...prev.rewrites,
            {
              name: trim(nextRewrite.name),
              commandWord: trim(nextRewrite.commandWord),
              instructions: trim(nextRewrite.instructions),
            },
          ],
        };
      });

      closeEditAddModal();
    },
    [closeEditAddModal, editingRewrite]
  );

  const handleEditRewrite = useCallback((rewrite: Rewrite) => {
    setRewriteFormModel(rewrite);
    setEditingRewrite(rewrite);
    setFormKey((prev) => prev + 1);
    setIsModalOpen(true);
  }, []);

  const handleDeleteRewrite = useCallback(() => {
    setLoadedSettings((prev) => {
      if (!prev || !rewritePendingDeletion) return prev;

      const nextRewrites = prev.rewrites.filter(
        (rewrite) => rewrite.commandWord !== rewritePendingDeletion.commandWord
      );
      const hasValidDefault = nextRewrites.some(
        (rewrite) => rewrite.commandWord === prev.defaultCommand
      );
      const nextDefaultCommand = hasValidDefault
        ? prev.defaultCommand
        : nextRewrites[0]?.commandWord ?? "";

      return {
        ...prev,
        rewrites: nextRewrites,
        defaultCommand: nextDefaultCommand,
      };
    });

    closeDeleteModal();
  }, [closeDeleteModal, rewritePendingDeletion]);

  return (
    <PageContainer>
      <h2>{t(translationKeys.screens.rewrites.title)}</h2>

      <ModalContainer
        id="edit-add-rewrite-modal"
        isOpen={isEditAddModalOpen}
        onAfterOpen={afterOpenEditAddModal}
        onRequestClose={closeEditAddModal}
      >
        <ModalContent
          style={{ minWidth: `${units(80)}px` }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <h2>
            {editingRewrite
              ? t(translationKeys.screens.rewrites.modal.editTitle)
              : t(translationKeys.screens.rewrites.modal.addTitle)}
          </h2>

          <AutoForm<RewriteFormData>
            key={formKey}
            model={rewriteFormModel}
            onSubmit={handleSubmitRewrite}
            onChangeModel={handleChangeRewriteModel}
            schema={rewriteBridge}
            onValidate={handleValidateRewriteForm}
            validate="onSubmit"
          >
            <ModalBody>
              <FormRow>
                <AutoField name="name" component={TextField} />
              </FormRow>

              <FormRow>
                <AutoField
                  name="commandWord"
                  component={CodeField}
                  autoCapitalize="off"
                  autoCorrect="off"
                  hint={
                    <Trans
                      i18nKey={
                        translationKeys.screens.rewrites.form.commandWord.hint
                      }
                      components={{ code: <code /> }}
                      values={{
                        example: `how are you///${
                          isEmpty(rewriteFormModel?.commandWord)
                            ? "comand"
                            : rewriteFormModel?.commandWord
                        }`,
                      }}
                    />
                  }
                />
              </FormRow>

              <FormRow>
                <AutoField name="instructions" component={TextAreaField} />
              </FormRow>

              <Errors />
            </ModalBody>

            <ModalActions>
              <NormalButton type="button" onClick={closeEditAddModal}>
                {t(translationKeys.screens.rewrites.modal.cancelButton)}
              </NormalButton>

              <NormalButton
                type="submit"
                disabled={!loadedSettings || !isFormComplete}
              >
                {editingRewrite
                  ? t(translationKeys.screens.rewrites.modal.saveButton)
                  : t(translationKeys.screens.rewrites.modal.addButton)}
              </NormalButton>
            </ModalActions>
          </AutoForm>
        </ModalContent>
      </ModalContainer>

      <ModalContainer
        id="delete-rewrite-modal"
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
      >
        <ModalContent
          style={{ minWidth: `${units(60)}px` }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <h2>{t(translationKeys.screens.rewrites.deleteModal.title)}</h2>

          <ModalBody>
            <p>
              {t(translationKeys.screens.rewrites.deleteModal.description, {
                name: rewritePendingDeletion?.name ?? "",
                commandWord: rewritePendingDeletion?.commandWord ?? "",
              })}
            </p>
          </ModalBody>

          <ModalActions>
            <NormalButton type="button" onClick={closeDeleteModal}>
              {t(translationKeys.screens.rewrites.modal.cancelButton)}
            </NormalButton>
            <NormalButton
              type="button"
              onClick={handleDeleteRewrite}
              disabled={!rewritePendingDeletion}
            >
              {t(translationKeys.screens.rewrites.deleteModal.deleteButton)}
            </NormalButton>
          </ModalActions>
        </ModalContent>
      </ModalContainer>

      <div>
        <Table>
          <thead>
            <tr>
              <th>
                <CellContainer>
                  {t(translationKeys.screens.rewrites.table.headers.name)}
                </CellContainer>
              </th>
              <th>
                <CellContainer>
                  {t(translationKeys.screens.rewrites.table.headers.command)}
                </CellContainer>
              </th>
              <th>
                <CellContainer>
                  {t(
                    translationKeys.screens.rewrites.table.headers.instructions
                  )}
                </CellContainer>
              </th>
              <th>
                <CellContainer>
                  {t(translationKeys.screens.rewrites.table.headers.actions)}
                </CellContainer>
              </th>
            </tr>
          </thead>
          <tbody>
            {rewrites.map((rewrite, index) => (
              <tr key={rewrite.commandWord}>
                <td>
                  <CellContainer>{rewrite.name}</CellContainer>
                </td>
                <td>
                  <CellContainer>
                    <CommandChip
                      backgroundColor={
                        commandPalette[index % commandPalette.length]
                      }
                    >
                      {rewrite.commandWord}
                    </CommandChip>
                  </CellContainer>
                </td>
                <td>
                  <CellContainer>{rewrite.instructions}</CellContainer>
                </td>
                <td>
                  <CellContainer style={{ marginLeft: `${units(-1)}px` }}>
                    <IconButton
                      onClick={() => handleEditRewrite(rewrite)}
                      title={t(
                        translationKeys.screens.rewrites.modal.editButtonLabel
                      )}
                      aria-label={t(
                        translationKeys.screens.rewrites.modal.editButtonLabel
                      )}
                    >
                      <PencilIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => openDeleteModal(rewrite)}
                      disabled={
                        rewrite.commandWord === loadedSettings?.defaultCommand
                      }
                      title={t(
                        translationKeys.screens.rewrites.modal.deleteButtonLabel
                      )}
                      aria-label={t(
                        translationKeys.screens.rewrites.modal.deleteButtonLabel
                      )}
                    >
                      <TrashIcon />
                    </IconButton>
                  </CellContainer>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div style={{ textAlign: "center" }}>
          <NormalButton onClick={openModal}>
            {t(translationKeys.screens.rewrites.newButton)}
          </NormalButton>
        </div>
      </div>
    </PageContainer>
  );
}
