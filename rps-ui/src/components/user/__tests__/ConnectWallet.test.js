import {
  render,
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import ConnectWallet from "../ConnectWallet";
import startMirage from "../../../mocks/server";
import { Response } from "miragejs";
import { QueryClientProvider, QueryClient } from "react-query";

let server;
const client = new QueryClient();
const Wrapper = ({ children }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);
beforeEach(() => {
  server = startMirage("test");
});

afterEach(() => {
  server.shutdown();
});

it.only("Can click connect to instantiate user", async () => {
  const userData = {
    name: "user 1",
    address: "123102312@asdfadsf",
  };

  server.post("/api/user", () => {
    return new Response(200, {}, { user: userData });
  });

  const { getByText } = render(
    <QueryClientProvider client={client}>
      <ConnectWallet />
    </QueryClientProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "connect" }));

  await waitForElementToBeRemoved(
    screen.getByRole("button", { name: "connect" })
  );

  expect(getByText(userData.address)).toBeDefined();
});

it("Return error if unable to connect", async () => {
  const userData = {
    name: "user 1",
    address: "123102312@asdfadsf",
  };

  server.post("/user", () => {
    return new Response(400, {}, { errors: ["some error"] });
  });
  const { getByText } = render(<ConnectWallet />);
  debugger;
  fireEvent.click(screen.getByRole("button", { name: "connect" }));

  await waitForElementToBeRemoved(
    screen.getByRole("button", { name: "connect" })
  );

  expect(getByText(userData.address)).toBeDefined();
});
