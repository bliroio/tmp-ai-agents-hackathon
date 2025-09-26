import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import SelectInput from "ink-select-input";
import Spinner from "ink-spinner";
import chalk from "chalk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Clear terminal function
const clearTerminal = () => {
  process.stdout.write("\x1B[2J\x1B[0f");
};

// Load configuration from JSON file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configData = JSON.parse(
  readFileSync(join(__dirname, "data", "config.json"), "utf8"),
);
const config = configData;

// Raw mode will be handled by Ink automatically

const App = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [meetingData, setMeetingData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentProgressStep, setCurrentProgressStep] = useState(0);
  const [progressCompleted, setProgressCompleted] = useState(false);

  const flowSteps = config.flow.steps;
  const currentStep = flowSteps[currentStepIndex];
  const isLastStep = currentStepIndex === flowSteps.length - 1;

  const handleAnswer = (answer) => {
    const newMeetingData = {
      ...meetingData,
      [currentStep.id]: answer,
    };
    setMeetingData(newMeetingData);

    if (currentStep.id === "template_selection") {
      // Move to processing step
      setIsProcessing(true);
      startProgressSteps();
    } else if (currentStep.id === "meeting_name") {
      // Move to template selection
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const startProgressSteps = () => {
    const processingStep = flowSteps.find((step) => step.id === "processing");
    const progressSteps = processingStep.steps;

    let stepIndex = 0;
    const processSteps = () => {
      if (stepIndex < progressSteps.length) {
        setCurrentProgressStep(stepIndex);
        setTimeout(() => {
          stepIndex++;
          processSteps();
        }, progressSteps[stepIndex].duration);
      } else {
        setProgressCompleted(true);
        setTimeout(() => {
          setIsProcessing(false);
          setShowSummary(true);
        }, 500);
      }
    };

    processSteps();
  };

  const handleTextSubmit = () => {
    if (inputValue.trim()) {
      handleAnswer(inputValue);
      setInputValue("");
    }
  };

  const handleTemplateSelect = (item) => {
    handleAnswer(item.value);
  };

  const renderStep = () => {
    if (!currentStep) return null;

    const { type, title, question, options, placeholder } = currentStep;

    return (
      <Box flexDirection="column" height="100%" width="100%">
        <Text
          color={config.ui.colors.secondary}
          bold
          marginBottom={2}
          textAlign="center"
        >
          {chalk.bold(title)}
        </Text>
        <Text color={config.ui.colors.text} marginBottom={3} textAlign="center">
          {question}
        </Text>

        {type === "text" && (
          <Box flexDirection="column" width="100%">
            <Text
              color={config.ui.colors.muted}
              marginBottom={2}
              textAlign="center"
            >
              Type your answer and press Enter:
            </Text>
            <Box width="60%">
              <TextInput
                focus
                style={{ textAlign: "center", alignSelf: "center" }}
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleTextSubmit}
                placeholder={placeholder || "Your answer here..."}
              />
            </Box>
          </Box>
        )}

        {type === "multiple_choice" && (
          <Box flexDirection="column" width="100%">
            <Text
              color={config.ui.colors.muted}
              marginBottom={2}
              textAlign="center"
            >
              Choose an option:
            </Text>
            <Box width="80%">
              <SelectInput
                items={options.map((option) => ({
                  label: `• ${option.label}`,
                  value: option.value,
                }))}
                onSelect={handleTemplateSelect}
              />
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  const renderProgress = () => {
    const processingStep = flowSteps.find((step) => step.id === "processing");
    const progressSteps = processingStep.steps;
    const currentStepData = progressSteps[currentProgressStep];

    return (
      <Box
        flexDirection="column"
        justifyContent="center"
        height="100%"
        width="100%"
      >
        <Text
          color={config.ui.colors.secondary}
          bold
          marginBottom={3}
          textAlign="center"
        >
          {config.messages.processing}
        </Text>

        <Box flexDirection="column" width="100%">
          {progressSteps.map((step, index) => (
            <Box
              key={step.id}
              flexDirection="row"
              alignItems="center"
              marginY={1}
              paddingX={2}
              gap={2}
            >
              <Text
                color={
                  index <= currentProgressStep
                    ? config.ui.colors.success
                    : config.ui.colors.muted
                }
                marginRight={2}
              >
                {index < currentProgressStep ? (
                  "✓"
                ) : index === currentProgressStep ? (
                  <Spinner type="dots" />
                ) : (
                  "○"
                )}
              </Text>
              <Text
                color={
                  index <= currentProgressStep
                    ? config.ui.colors.text
                    : config.ui.colors.muted
                }
              >
                {step.label}
              </Text>
            </Box>
          ))}
        </Box>

        {progressCompleted && (
          <Text
            color={config.ui.colors.success}
            marginTop={3}
            textAlign="center"
          >
            {config.messages.complete}
          </Text>
        )}
      </Box>
    );
  };

  const renderSummary = () => {
    const selectedTemplate = config.templates[meetingData.template_selection];

    return (
      <Box
        flexDirection="column"
        justifyContent="center"
        height="100%"
        width="100%"
      >
        <Text
          color={config.ui.colors.success}
          bold
          marginBottom={3}
          textAlign="center"
        >
          Meeting Setup Complete!
        </Text>

        <Box flexDirection="column" width="100%">
          <Box flexDirection="column" marginY={2} paddingX={2}>
            <Text
              color={config.ui.colors.info}
              bold
              textAlign="center"
              marginBottom={1}
            >
              Meeting Details
            </Text>
            <Text
              color={config.ui.colors.text}
              textAlign="center"
              marginBottom={1}
            >
              Name: {meetingData.meeting_name}
            </Text>
            <Text
              color={config.ui.colors.text}
              textAlign="center"
              marginBottom={2}
            >
              Template: {selectedTemplate?.name}
            </Text>
          </Box>

          <Box flexDirection="column" marginY={2} paddingX={2}>
            <Text
              color={config.ui.colors.info}
              bold
              textAlign="center"
              marginBottom={1}
            >
              Generated Agenda
            </Text>
            <Text
              color={config.ui.colors.text}
              textAlign="center"
              marginBottom={2}
            >
              Duration: {selectedTemplate?.duration}
            </Text>
            {selectedTemplate?.agenda.map((item, index) => (
              <Text
                key={index}
                color={config.ui.colors.muted}
                textAlign="center"
                marginBottom={1}
              >
                • {item}
              </Text>
            ))}
          </Box>

          <Box flexDirection="column" marginY={2} paddingX={2}>
            <Text
              color={config.ui.colors.info}
              bold
              textAlign="center"
              marginBottom={1}
            >
              AI Assistant Ready
            </Text>
            <Text
              color={config.ui.colors.text}
              textAlign="center"
              marginBottom={2}
            >
              Your AI meeting assistant is configured and ready to help
              facilitate the meeting.
            </Text>
          </Box>

          <Box flexDirection="column" marginY={2} paddingX={2}>
            <Text
              color={config.ui.colors.info}
              bold
              textAlign="center"
              marginBottom={1}
            >
              Backend Services
            </Text>
            <Text
              color={config.ui.colors.text}
              textAlign="center"
              marginBottom={2}
            >
              All backend services are running and ready to capture meeting
              data.
            </Text>
          </Box>
        </Box>

        <Text color={config.ui.colors.muted} marginTop={3} textAlign="center">
          {config.messages.exit}
        </Text>
      </Box>
    );
  };

  useInput((input, key) => {
    if (showSummary && key.return) {
      process.exit(0);
    }
  });

  return (
    <Box
      flexDirection="column"
      height="100%"
      width="100%"
      padding={0}
      justifyContent="center"
    >
      <Box
        flexDirection="column"
        width="100%"
        height="100%"
        padding={2}
        alignItems="center"
        justifyContent="center"
      >
        <Box
          flexDirection="column"
          marginBottom={2}
          justifyContent="center"
          alignItems="center"
        >
          <Text color={config.ui.colors.primary}>{config.app.title}</Text>
          <Text color={config.ui.colors.muted}>{config.app.subtitle}</Text>
        </Box>

        <Box flexGrow={1} flexDirection="column" alignItems="center">
          <Box
            borderStyle="round"
            borderColor="yellow"
            padding={3}
            width="80%"
            minHeight={20}
          >
            {isProcessing
              ? renderProgress()
              : showSummary
              ? renderSummary()
              : renderStep()}
          </Box>
        </Box>

        {/* Footer Section */}
        {!showSummary && !isProcessing && (
          <Box marginTop={2} justifyContent="center">
            <Text color={config.ui.colors.muted}>
              Step: {currentStepIndex + 1} of {flowSteps.length - 1}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default App;
