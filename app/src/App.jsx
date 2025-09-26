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

// Load questions from JSON file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const questionsData = JSON.parse(
  readFileSync(join(__dirname, "data", "questions.json"), "utf8"),
);
const questions = questionsData.questions;

// Raw mode will be handled by Ink automatically

const App = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Component mounted
  useEffect(() => {
    // App is ready
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = (answer) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: answer,
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowResults(true);
      }, 2000);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleTextSubmit = () => {
    if (inputValue.trim()) {
      handleAnswer(inputValue);
      setInputValue("");
    }
  };

  const handleYesNoSelect = (item) => {
    handleAnswer(item.value);
  };

  const handleMultipleChoiceSelect = (item) => {
    handleAnswer(item.value);
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const { type, question, options } = currentQuestion;

    return (
      <Box flexDirection="column" height="100%" width="100%">
        <Text color="yellow" bold marginBottom={2} textAlign="center">
          {chalk.bold(
            `Question ${currentQuestionIndex + 1} of ${questions.length}`,
          )}
        </Text>
        <Text color="white" marginBottom={3} textAlign="center">
          {question}
        </Text>

        {type === "text" && (
          <Box flexDirection="column" width="100%">
            <Text color="gray" marginBottom={2} textAlign="center">
              Type your answer and press Enter:
            </Text>
            <Box width="60%">
              <TextInput
                focus
                style={{ textAlign: "center", alignSelf: "center" }}
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleTextSubmit}
                placeholder="Your answer here..."
              />
            </Box>
          </Box>
        )}

        {type === "yes_no" && (
          <Box flexDirection="column" width="100%">
            <Text color="gray" marginBottom={2} textAlign="center">
              Select your answer:
            </Text>
            <Box width="40%">
              <SelectInput
                items={[
                  { label: chalk.green("✓ Yes"), value: "yes" },
                  { label: chalk.red("✗ No"), value: "no" },
                ]}
                onSelect={handleYesNoSelect}
              />
            </Box>
          </Box>
        )}

        {type === "multiple_choice" && (
          <Box flexDirection="column" width="100%">
            <Text color="gray" marginBottom={2} textAlign="center">
              Choose an option:
            </Text>
            <Box width="70%">
              <SelectInput
                items={options.map((option) => ({
                  label: `• ${option}`,
                  value: option,
                }))}
                onSelect={handleMultipleChoiceSelect}
              />
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  const renderResults = () => {
    return (
      <Box
        flexDirection="column"
        justifyContent="center"
        height="100%"
        width="100%"
      >
        <Text color="green" bold marginBottom={3} textAlign="center">
          Quest Complete!
        </Text>
        <Text color="yellow" marginBottom={3} textAlign="center">
          Your Discovery Profile:
        </Text>
        <Box flexDirection="column" width="100%">
          {Object.entries(answers).map(([questionId, answer]) => {
            const question = questions.find((q) => q.id === questionId);
            return (
              <Box
                key={questionId}
                flexDirection="column"
                marginY={1}
                paddingX={2}
              >
                <Text color="blue" textAlign="center" marginBottom={1}>
                  {question.question}
                </Text>
                <Text color="white" textAlign="center" marginBottom={2}>
                  → {answer}
                </Text>
              </Box>
            );
          })}
        </Box>
        <Text color="gray" marginTop={3} textAlign="center">
          Press Enter to exit...
        </Text>
      </Box>
    );
  };

  const renderLoading = () => {
    return (
      <Box
        flexDirection="column"
        justifyContent="center"
        height="100%"
        width="100%"
      >
        <Text color="yellow" textAlign="center">
          <Spinner type="dots" /> Analyzing your profile...
        </Text>
      </Box>
    );
  };

  useInput((input, key) => {
    if (showResults && key.return) {
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
          <Text color="#FF6B35">Bliro Quest</Text>
          <Text color="gray">
            AWS Hackathon - Interactive Discovery Platform
          </Text>
        </Box>

        <Box flexGrow={1} flexDirection="column" alignItems="center">
          <Box
            borderStyle="round"
            borderColor="yellow"
            padding={3}
            width="80%"
            minHeight={20}
          >
            {isLoading
              ? renderLoading()
              : showResults
              ? renderResults()
              : renderQuestion()}
          </Box>
        </Box>

        {/* Footer Section */}
        {!showResults && !isLoading && (
          <Box marginTop={2} justifyContent="center">
            <Text color="gray">
              Progress: {currentQuestionIndex + 1}/{questions.length} questions
              completed
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default App;
