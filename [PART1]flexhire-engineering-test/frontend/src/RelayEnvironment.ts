// RelayEnvironment.ts
import {
  Environment,
  Network,
  RecordSource,
  Store,
  FetchFunction,
} from "relay-runtime";

const fetchFn: FetchFunction = async (request, variables) => {
  const apiKey = localStorage.getItem("flexhireApiKey");

  if (!apiKey) {
    throw new Error("No API key found");
  }

  const resp = await fetch("/api/flexhire", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: request.text,
      variables,
      apiKey,
    }),
  });

  const json = await resp.json();

  // Relay expects GraphQL errors to be thrown
  if (json.errors) {
    throw new Error(
      `Error fetching GraphQL query '${request.name}': ${JSON.stringify(
        json.errors
      )}`
    );
  }

  return json;
};

export function initRelayEnvironment() {
  return new Environment({
    network: Network.create(fetchFn),
    store: new Store(new RecordSource()),
  });
}

const environment = initRelayEnvironment();
export default environment;
