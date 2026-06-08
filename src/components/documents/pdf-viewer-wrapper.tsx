import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const PdfViewer = dynamic(
  () => import("./pdf-viewer").then((mod) => mod.PdfViewer),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[700px] w-full rounded-lg" />,
  }
);
