"use client";

import { scan } from "react-scan";
import { useEffect } from "react";

const ReactScan = () => {
  useEffect(() => {
    scan({
      enabled: true,
    });
  }, []);

  return null;
};

export default ReactScan;

