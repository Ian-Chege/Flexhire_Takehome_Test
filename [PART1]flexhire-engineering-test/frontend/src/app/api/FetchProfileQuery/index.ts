import { graphql, fetchQuery } from "react-relay";
import { initRelayEnvironment } from "@/RelayEnvironment";

export const fetchProfile = async () => {
  const query = graphql`
    query FetchProfileQuery {
      currentUser {
        name
        avatarUrl
      }
    }
  `;

  const environment = initRelayEnvironment();
  const response = fetchQuery(
    environment,
    query,
    {},
    { fetchPolicy: "network-only" }
  );
  return response;
};
