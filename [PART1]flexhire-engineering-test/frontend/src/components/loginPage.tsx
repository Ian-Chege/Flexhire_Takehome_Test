"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, TextField, Button, Typography, Box } from "@mui/material";

export const LoginPage: React.FC = () => {
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/flexhire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey, // Send the API key in the headers
        },
        body: JSON.stringify({
          query: `query { currentUser { name } }`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate. Please check your API key.");
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      // If successful, store the API key and redirect to the profile page
      localStorage.setItem("flexhireApiKey", apiKey);
      router.push("/profile");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Typography variant="h1" component="h1" gutterBottom>
          Flexhire
        </Typography>
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Flexhire API Key"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body1">
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
};
