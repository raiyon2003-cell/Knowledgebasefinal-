import { cache } from "react";
import { getDivisions } from "@/actions/divisions";
import { getActiveDepartments } from "@/actions/departments";
import { getDocumentTypes } from "@/actions/document-types";
import { getProcessCategories } from "@/actions/process-categories";
import { getActiveUsers } from "@/actions/users";

export const getDocumentFilterOptions = cache(async () => {
  const [divisions, departments, documentTypes, processCategories, owners] =
    await Promise.all([
      getDivisions(),
      getActiveDepartments(),
      getDocumentTypes(),
      getProcessCategories(),
      getActiveUsers(),
    ]);

  return {
    divisions: divisions.filter((d) => d.status === "active"),
    departments,
    documentTypes: documentTypes.filter((d) => d.status === "active"),
    processCategories: processCategories.filter((d) => d.status === "active"),
    owners,
  };
});
