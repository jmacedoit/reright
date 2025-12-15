import { useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import { styled } from "@linaria/react";
import { PageContainer } from "../components/containers";
import { translationKeys } from "../translations";
import { KeyBindingDisplay } from "../components/key-binding-display";
import { commandPalette, palette } from "../styles/colors";
import { units } from "../styles/dimensions";
import { SettingsContext } from "../contexts/settings";
import color from "color";

/*
 * Styles.
 */

const Section = styled.section`
  margin-bottom: ${units(5)}px;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: ${units(2)}px;
  color: ${palette.darkGrey};
  display: flex;
  align-items: center;
  gap: ${units(1)}px;

  &::before {
    content: "";
    display: inline-block;
    width: 4px;
    height: 1.1em;
    background: linear-gradient(
      135deg,
      ${commandPalette[0]},
      ${commandPalette[1]}
    );
    border-radius: 2px;
  }
`;

const ExampleCard = styled.div`
  background: ${palette.ultraLightGray};
  border: 1px solid ${palette.veryLightGrey};
  border-radius: ${units(1.5)}px;
  padding: ${units(3)}px;
  margin-bottom: ${units(2)}px;
`;

const StepsContainer = styled.ol`
  list-style: none;
  counter-reset: step-counter;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${units(2)}px;
`;

const Step = styled.li`
  counter-increment: step-counter;
  display: flex;
  align-items: flex-start;
  gap: ${units(1.5)}px;
  line-height: 1.6;

  &::before {
    content: counter(step-counter);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: ${units(3)}px;
    height: ${units(3)}px;
    background: ${palette.darkGrey};
    color: white;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 600;
  }
`;

const StepContent = styled.div`
  flex: 1;
  padding-top: 2px;
`;

const SelectedText = styled.span`
  background: ${palette.veryLightBlue};
  padding: 2px 6px;
  border-radius: 3px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI",
    system-ui, sans-serif;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #0066cc;
    border-radius: 2px 0 0 2px;
  }
`;

const CommandWord = styled.code<{ colorIndex?: number }>`
  background: ${({ colorIndex = 0 }) =>
    commandPalette[colorIndex % commandPalette.length]};
  padding: 2px 8px;
  border-radius: ${units(3)}px;
  font-family: monospace;
  font-size: 0.9em;
`;

const Separator = styled.code`
  background: ${palette.veryLightGrey};
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
  color: ${palette.mediumGrey};
  font-weight: 600;
`;

const TextBlock = styled.div`
  background: white;
  border: 1px solid ${palette.veryLightGrey};
  border-radius: ${units(1)}px;
  padding: ${units(1.5)}px ${units(2)}px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI",
    system-ui, sans-serif;
  margin: ${units(1)}px 0;
  display: inline-block;
`;

const ResultBlock = styled(TextBlock)`
  background: ${palette.veryLightMint};
  border-color: ${commandPalette[2]};
`;

const InlineKeyBinding = styled(KeyBindingDisplay)`
  margin: 0 4px;
`;

const Hint = styled.div`
  margin-top: ${units(3)}px;
  padding: ${units(2)}px;
  background: ${color(palette.butterYellow).lighten(0.02).toString()};
  border-radius: ${units(1)}px;
  font-size: 0.9em;
  color: ${palette.darkGrey};

  strong {
    color: ${palette.rust};
  }
`;

const AdHocInstructions = styled.span`
  background: linear-gradient(
    135deg,
    ${palette.lightPink},
    ${palette.lightOrange}
  );
  padding: 2px 8px;
  border-radius: 3px;
  font-style: italic;
  font-size: 0.95em;
`;

const Intro = styled.p`
  margin-bottom: ${units(3)}px;
  line-height: 1.7;
  color: ${palette.darkGrey};
`;

const ModeLabel = styled.span`
  display: inline-block;
  background: ${palette.darkGrey};
  color: white;
  padding: 2px 10px;
  border-radius: ${units(3)}px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${units(1)}px;
`;

const SmallNote = styled.p`
  font-size: 0.875rem;
  color: ${palette.mediumGrey};
  margin-bottom: ${units(2)}px;
`;

/*
 * Component.
 */

export function HowTo() {
  const { t } = useTranslation();
  const settingsContext = useContext(SettingsContext);
  const settings = settingsContext.settings;
  const shortcut = settings?.rewriteShortcut ?? "";
  const commandSeparator = settings?.commandSeparator ?? "///";
  const defaultCommand = settings?.defaultCommand ?? "";
  const defaultCommandIndex =
    settings?.rewrites?.findIndex(
      (rewrite) => rewrite.commandWord === defaultCommand
    ) ?? 0;

  return (
    <PageContainer>
      <h2>{t(translationKeys.screens.howto.title)}</h2>

      <Intro>{t(translationKeys.screens.howto.intro)}</Intro>

      {/* Mode 1: Quick Rewrite */}
      <Section>
        <ModeLabel>{t(translationKeys.screens.howto.mode1.label)}</ModeLabel>
        <SectionTitle>
          {t(translationKeys.screens.howto.mode1.title)}
        </SectionTitle>
        <SmallNote>
          <Trans
            i18nKey={translationKeys.screens.howto.mode1.description}
            values={{ command: defaultCommand }}
            components={{
              command: <CommandWord colorIndex={defaultCommandIndex} />,
            }}
          />
          <br />
          {t(translationKeys.screens.howto.mode1.exampleNote)}
        </SmallNote>

        <ExampleCard>
          <StepsContainer>
            <Step>
              <StepContent>
                <Trans
                  i18nKey={translationKeys.screens.howto.mode1.step1}
                  components={{ strong: <strong /> }}
                />
                <br />
                <TextBlock>
                  <SelectedText>
                    {t(translationKeys.screens.howto.mode1.exampleInput)}
                  </SelectedText>
                </TextBlock>
              </StepContent>
            </Step>

            <Step>
              <StepContent>
                <Trans
                  i18nKey={translationKeys.screens.howto.mode1.step2}
                  components={{
                    shortcut: <InlineKeyBinding keys={shortcut} />,
                  }}
                />
              </StepContent>
            </Step>

            <Step>
              <StepContent>
                <Trans
                  i18nKey={translationKeys.screens.howto.mode1.step3}
                  components={{ strong: <strong /> }}
                />
                <br />
                <ResultBlock>
                  {t(translationKeys.screens.howto.mode1.exampleOutput)}
                </ResultBlock>
              </StepContent>
            </Step>
          </StepsContainer>
        </ExampleCard>
      </Section>

      {/* Mode 2: Command-Specific Rewrite */}
      <Section>
        <ModeLabel>{t(translationKeys.screens.howto.mode2.label)}</ModeLabel>
        <SectionTitle>
          {t(translationKeys.screens.howto.mode2.title)}
        </SectionTitle>
        <SmallNote>
          <Trans
            i18nKey={translationKeys.screens.howto.mode2.description}
            values={{ separator: commandSeparator }}
            components={{
              separator: <Separator />,
            }}
          />
        </SmallNote>

        <ExampleCard>
          <StepsContainer>
            <Step>
              <StepContent>
                <Trans
                  i18nKey={translationKeys.screens.howto.mode2.step1}
                  values={{ separator: commandSeparator }}
                  components={{
                    strong: <strong />,
                    separator: <Separator />,
                  }}
                />
                <br />
                <TextBlock>
                  <SelectedText>
                    {t(translationKeys.screens.howto.mode2.exampleInput)}
                    <Separator>{commandSeparator}</Separator>
                    <CommandWord colorIndex={1}>
                      {t(translationKeys.screens.howto.mode2.exampleCommand)}
                    </CommandWord>
                  </SelectedText>
                </TextBlock>
              </StepContent>
            </Step>

            <Step>
              <StepContent>
                <Trans
                  i18nKey={translationKeys.screens.howto.mode2.step2}
                  components={{
                    strong: <strong />,
                    shortcut: <InlineKeyBinding keys={shortcut} />,
                  }}
                />
              </StepContent>
            </Step>

            <Step>
              <StepContent>
                <Trans
                  i18nKey={translationKeys.screens.howto.mode2.step3}
                  components={{ strong: <strong /> }}
                />
                <br />
                <ResultBlock>
                  {t(translationKeys.screens.howto.mode2.exampleOutput)}
                </ResultBlock>
              </StepContent>
            </Step>
          </StepsContainer>
        </ExampleCard>

        <SmallNote>
          <Trans
            i18nKey={translationKeys.screens.howto.mode2.note}
            components={{ strong: <strong /> }}
          />
        </SmallNote>
      </Section>

      {/* Mode 3: Ad-hoc Instructions */}
      <Section>
        <ModeLabel>{t(translationKeys.screens.howto.mode3.label)}</ModeLabel>
        <SectionTitle>
          {t(translationKeys.screens.howto.mode3.title)}
        </SectionTitle>
        <SmallNote>
          <Trans
            i18nKey={translationKeys.screens.howto.mode3.description}
            values={{ separator: commandSeparator }}
            components={{
              separator: <Separator />,
            }}
          />
        </SmallNote>

        <ExampleCard>
          <StepsContainer>
            <Step>
              <StepContent>
                <Trans
                  i18nKey={translationKeys.screens.howto.mode3.step1}
                  values={{ separator: commandSeparator }}
                  components={{
                    strong: <strong />,
                    separator: <Separator />,
                  }}
                />
                <TextBlock>
                  <SelectedText>
                    {t(translationKeys.screens.howto.mode3.exampleInput)}
                    <Separator>{commandSeparator}</Separator>
                    <AdHocInstructions>
                      {t(
                        translationKeys.screens.howto.mode3.exampleInstructions
                      )}
                    </AdHocInstructions>
                  </SelectedText>
                </TextBlock>
              </StepContent>
            </Step>

            <Step>
              <StepContent>
                <Trans
                  i18nKey={translationKeys.screens.howto.mode3.step2}
                  components={{
                    strong: <strong />,
                    shortcut: <InlineKeyBinding keys={shortcut} />,
                  }}
                />
              </StepContent>
            </Step>

            <Step>
              <StepContent>
                <Trans
                  i18nKey={translationKeys.screens.howto.mode3.step3}
                  components={{ strong: <strong /> }}
                />
                <ResultBlock style={{ whiteSpace: "pre-wrap" }}>
                  {t(translationKeys.screens.howto.mode3.exampleOutput)}
                </ResultBlock>
              </StepContent>
            </Step>
          </StepsContainer>
        </ExampleCard>

        <SmallNote>
          <Trans
            i18nKey={translationKeys.screens.howto.mode3.note}
            values={{ separator: commandSeparator }}
            components={{
              separator: <Separator />,
            }}
          />
        </SmallNote>
      </Section>

      <Hint>
        <Trans
          i18nKey={translationKeys.screens.howto.trayHint}
          components={{ strong: <strong /> }}
        />
      </Hint>
    </PageContainer>
  );
}
