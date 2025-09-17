"use client";

import React from "react";

interface Props {
  sessionId: string;
}

const SessionDetailsPage: React.FC<Props> = ({ sessionId }) => {
  return <div>{sessionId}</div>;
};

export default SessionDetailsPage;
