import Link from "next/link";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocumentStatus } from "@/types/database";

interface RecentDocument {
  id: string;
  title: string;
  status: DocumentStatus;
  created_at: string;
  owner?: { full_name: string } | null;
  department?: { name: string } | null;
}

interface RecentActivityProps {
  documents: RecentDocument[];
}

export function RecentActivity({ documents }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recently Uploaded Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No documents uploaded yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="font-medium hover:underline"
                    >
                      {doc.title}
                    </Link>
                  </TableCell>
                  <TableCell>{doc.department?.name || "—"}</TableCell>
                  <TableCell>{doc.owner?.full_name || "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={doc.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(doc.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
