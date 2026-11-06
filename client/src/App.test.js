import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { MessageList } from "./components/MessageList";
import Sidebar from "./components/Sidebar";

test("renders empty conversation state when no messages exist", () => {
  render(
    <MessageList
      messages={[]}
      user={{ username: "sourabh" }}
      currentChat='alex'
    />,
  );
  expect(screen.getByText(/No messages with alex yet/i)).toBeInTheDocument();
});

test("renders messages with timestamps and read receipts", () => {
  const sampleMessages = [
    {
      _id: "1",
      sender: "sourabh",
      receiver: "alex",
      message: "Hello Alex!",
      read: true,
      createdAt: "2026-11-06T10:30:00.000Z",
    },
    {
      _id: "2",
      sender: "alex",
      receiver: "sourabh",
      message: "Hi Sourabh!",
      read: false,
      createdAt: "2026-11-06T10:31:00.000Z",
    },
  ];

  render(
    <MessageList
      messages={sampleMessages}
      user={{ username: "sourabh" }}
      currentChat='alex'
    />,
  );

  expect(screen.getByText("Hello Alex!")).toBeInTheDocument();
  expect(screen.getByText("Hi Sourabh!")).toBeInTheDocument();
  expect(screen.getByText("✔✔")).toBeInTheDocument();
});

test("renders sidebar contacts and logout button", () => {
  const users = [{ _id: "u1", username: "alex" }];
  render(
    <Sidebar
      users={users}
      totalUsersCount={1}
      loadingUsers={false}
      currentChat={null}
      fetchMessages={() => {}}
      onResetChat={() => {}}
      avatarLetter={(n) => n[0].toUpperCase()}
      user={{ username: "sourabh" }}
      onLogout={() => {}}
    />,
  );

  expect(screen.getByText("alex")).toBeInTheDocument();
  expect(screen.getByText("sourabh")).toBeInTheDocument();
});

test("clicking ChatFlow brand in sidebar triggers redirect callback", () => {
  const handleRedirect = jest.fn();
  render(
    <Sidebar
      users={[]}
      totalUsersCount={0}
      loadingUsers={false}
      currentChat='alex'
      fetchMessages={() => {}}
      onResetChat={handleRedirect}
      avatarLetter={(n) => n[0].toUpperCase()}
      user={{ username: "sourabh" }}
      onLogout={() => {}}
    />,
  );

  const brandBtn = screen.getByTitle("ChatFlow Home");
  fireEvent.click(brandBtn);
  expect(handleRedirect).toHaveBeenCalledTimes(1);
});
