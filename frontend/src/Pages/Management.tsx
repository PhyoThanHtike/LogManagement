import CreateLogDialog from "@/AppComponents/Dialogs/CreateLogDialog";
import { Button } from "@/components/ui/button";
import React from "react";

const Management = () => {
  return (
    <>
      <CreateLogDialog
        trigger={<Button variant="outline">Create Log</Button>}
      />
    </>
  );
};

export default Management;
