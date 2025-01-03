// profile.tsx
"use client";

import React, { Suspense } from "react";
import {
  Container,
  Avatar,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  graphql,
  usePreloadedQuery,
  PreloadedQuery,
  useQueryLoader,
} from "react-relay";
import { pageQuery } from "./__generated__/pageQuery.graphql";

const profileQuery = graphql`
  query pageQuery {
    currentUser {
      name
      avatarUrl
    }
  }
`;

interface ProfileContentProps {
  queryRef: PreloadedQuery<pageQuery>;
}

const ProfileContent: React.FC<ProfileContentProps> = ({ queryRef }) => {
  const data = usePreloadedQuery(profileQuery, queryRef);
  const user = data.currentUser;

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h6" align="center">
          User not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
        <Avatar
          alt={user.name || ""}
          src={user.avatarUrl || ""}
          sx={{ width: 100, height: 100 }}
        />
        <Typography variant="h4" mt={2}>
          {user.name}
        </Typography>
      </Box>
    </Container>
  );
};

const ProfilePage: React.FC = () => {
  const [queryRef, loadQuery] = useQueryLoader<pageQuery>(profileQuery);

  React.useEffect(() => {
    const apiKey = localStorage.getItem("flexhireApiKey");
    if (!apiKey) {
      // Handle no API key case
      return;
    }

    loadQuery({}, { fetchPolicy: "network-only" });
  }, [loadQuery]);

  if (!queryRef) {
    return (
      <Container maxWidth="sm">
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Suspense
      fallback={
        <Container maxWidth="sm">
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        </Container>
      }
    >
      <ProfileContent queryRef={queryRef} />
    </Suspense>
  );
};

export default ProfilePage;
