// src/Chatbot.jsx
import { useState, useRef, useEffect } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import ReactMarkdown from "react-markdown";
import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  ButtonGroup,
  Row,
  Col,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const COMMUNITY_AI_QUERY = gql`
  query CommunityAIQuery($input: String!, $userId: String!) {
    communityAIQuery(input: $input, userId: $userId) {
      text
      suggestedQuestions
      retrievedPosts
    }
  }
`;

const userId = "test-user-123";

const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [conversation]);

  const [getAIResponse] = useLazyQuery(COMMUNITY_AI_QUERY, {
    onCompleted: (data) => {
      setConversation((prev) => [
        ...prev,
        {
          role: "AI",
          content: data.communityAIQuery.text,
          suggestedQuestions: data.communityAIQuery.suggestedQuestions,
          retrievedPosts: data.communityAIQuery.retrievedPosts,
        },
      ]);
      setIsTyping(false);
    },
  });

  const sendQuery = (inputQuery, includeContext = false) => {
    if (!inputQuery.trim()) return;

    const context = includeContext
      ? conversation.map((m) => `${m.role}: ${m.content}`).join("\n") + "\n"
      : "";

    const fullInput = context + inputQuery;

    setConversation((prev) => [...prev, { role: "User", content: inputQuery }]);
    setQuery("");
    setIsTyping(true);
    getAIResponse({ variables: { input: fullInput, userId } });
  };

  const handleFollowUpClick = (question) => {
    sendQuery(question, true); // ✅ Include previous context for Gemini
  };

  return (
    <Container className="mt-4">
      <h3 className="text-center mb-4">🧠 Community AI Chatbot</h3>

      <Card className="mx-auto shadow-sm" style={{ maxWidth: "800px", height: "500px" }}>
        <Card.Body className="overflow-auto d-flex flex-column" style={{ height: "100%" }}>
          {conversation.map((msg, index) => (
            <Card
              key={index}
              bg={msg.role === "User" ? "primary" : "light"}
              text={msg.role === "User" ? "white" : "dark"}
              className={`mb-2 ${msg.role === "User" ? "align-self-end" : "align-self-start"}`}
              style={{ maxWidth: "75%" }}
            >
              <Card.Body>
                <strong>{msg.role}:</strong>
                <div className="mt-2">
                  {msg.role === "AI" ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    <div>{msg.content}</div>
                  )}
                </div>

                {msg.retrievedPosts && msg.retrievedPosts.length > 0 && (
                  <div className="mt-3">
                    <small className="text-muted">🔍 Retrieved Context:</small>
                    <ul className="ps-3">
                      {msg.retrievedPosts.map((fact, i) => (
                        <li key={i}>
                          <small>{fact}</small>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.suggestedQuestions?.length > 0 && (
                  <>
                    <strong className="mt-3 d-block">💡 Suggested Follow-Ups:</strong>
                    <ButtonGroup className="mt-2 flex-wrap">
                      {msg.suggestedQuestions.map((q, idx) => (
                        <Button
                          key={idx}
                          variant="outline-success"
                          size="sm"
                          className="me-2 mb-2"
                          onClick={() => handleFollowUpClick(q)}
                        >
                          {q}
                        </Button>
                      ))}
                    </ButtonGroup>
                  </>
                )}
              </Card.Body>
            </Card>
          ))}

          {isTyping && (
            <div className="text-muted d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              AI is thinking...
            </div>
          )}

          <div ref={chatEndRef} />
        </Card.Body>
      </Card>

      <Form
        className="mt-3 mx-auto"
        style={{ maxWidth: "800px" }}
        onSubmit={(e) => {
          e.preventDefault();
          sendQuery(query);
        }}
      >
        <Row className="g-2 align-items-end">
          <Col xs={9}>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Ask a community-related question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isTyping}
            />
          </Col>
          <Col xs={3}>
            <Button type="submit" className="w-100" disabled={isTyping}>
              Send
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default Chatbot;
