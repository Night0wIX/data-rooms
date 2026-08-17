import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Copy, Check, Link as LinkIcon, X } from "lucide-react";
import { useShares } from "../hooks/use-shares";
import { useCreateShare } from "../hooks/use-create-share";
import { useRevokeShare } from "../hooks/use-revoke-share";
import { getFieldError } from "@/shared/utils/get-field-error";
import type { ShareResourceType } from "../api/sharing.types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { inviteUserSchema } from "../schemas/invite-user.schema";
import { generatePath } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";

export interface ShareTarget {
  resourceType: ShareResourceType;
  resourceId: string;
  resourceName: string;
}

interface ShareDialogProps {
  target: ShareTarget | null;
  onOpenChange: (open: boolean) => void;
}

function buildPublicShareUrl(token: string): string {
  return `${window.location.origin}${generatePath(ROUTES.publicShare, { token })}`;
}

const RESOURCE_LABEL: Record<ShareResourceType, string> = {
  DATA_ROOM: "data room",
  FOLDER: "folder",
  FILE: "file",
};

export function ShareDialog({ target, onOpenChange }: ShareDialogProps) {
  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share &ldquo;{target?.resourceName}&rdquo;</DialogTitle>
        </DialogHeader>
        {target && (
          <ShareDialogBody
            target={target}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ShareDialogBody({
  target,
  onClose,
}: {
  target: ShareTarget;
  onClose: () => void;
}) {
  const { data: shares = [], isPending } = useShares(
    target.resourceType,
    target.resourceId,
  );
  const createShare = useCreateShare();
  const revokeShare = useRevokeShare();
  const [copied, setCopied] = useState(false);

  const publicShare = shares.find((s) => s.shareType === "PUBLIC") ?? null;
  const userShares = shares.filter((s) => s.shareType === "USER");
  const resourceLabel = RESOURCE_LABEL[target.resourceType];

  const handleCopyLink = async () => {
    if (!publicShare?.token) return;
    await navigator.clipboard.writeText(buildPublicShareUrl(publicShare.token));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emailForm = useForm({
    defaultValues: { email: "" },
    validators: { onChange: inviteUserSchema },
    onSubmit: ({ value }) => {
      createShare.mutate(
        {
          resourceType: target.resourceType,
          resourceId: target.resourceId,
          shareType: "USER",
          role: "VIEWER",
          sharedWithUserEmail: value.email.trim(),
        },
        { onSuccess: () => emailForm.reset() },
      );
    },
  });

  return (
    <div className="space-y-6">
      {/* Public link */}
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Public link</h3>

        {publicShare ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={buildPublicShareUrl(publicShare.token!)}
                className="text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view this {resourceLabel} and everything
              inside it.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={revokeShare.isPending}
              onClick={() =>
                revokeShare.mutate({
                  shareId: publicShare.id,
                  resourceType: target.resourceType,
                  resourceId: target.resourceId,
                })
              }
            >
              Disable public link
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Anyone with the link will be able to view this {resourceLabel}
              {target.resourceType !== "FILE" && " and everything inside it"}.
              This does not require a login.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={createShare.isPending}
              onClick={() =>
                createShare.mutate({
                  resourceType: target.resourceType,
                  resourceId: target.resourceId,
                  shareType: "PUBLIC",
                  role: "VIEWER",
                })
              }
            >
              <LinkIcon className="size-4" />
              Create public link
            </Button>
          </div>
        )}
      </section>

      {/* Invite by email */}
      <section className="space-y-2 border-t border-border pt-4">
        <h3 className="text-sm font-medium text-foreground">Invite people</h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            emailForm.handleSubmit();
          }}
          className="flex items-start gap-2"
        >
          <emailForm.Field name="email">
            {(field) => (
              <FormField
                name="email"
                label=""
                error={getFieldError(field.state.meta.errors)}
                className="flex-1"
              >
                {(controlProps) => (
                  <Input
                    {...controlProps}
                    type="email"
                    placeholder="person@company.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </FormField>
            )}
          </emailForm.Field>

          <emailForm.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                loading={isSubmitting || createShare.isPending}
                disabled={!canSubmit}
              >
                Invite
              </Button>
            )}
          </emailForm.Subscribe>
        </form>

        {createShare.isError && (
          <p className="text-xs text-destructive">
            Couldn&apos;t invite this person. Make sure they&apos;ve signed in
            at least once, then try again.
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Invited people get read-only access to this {resourceLabel}
          {target.resourceType !== "FILE" && " and everything inside it"}.
        </p>
      </section>

      {/* Current access */}
      <section className="space-y-2 border-t border-border pt-4">
        <h3 className="text-sm font-medium text-foreground">
          People with access
        </h3>

        {isPending ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : userShares.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No one else has been invited yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {userShares.map((share) => (
              <li
                key={share.id}
                className="flex items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
              >
                <span
                  className="truncate text-foreground"
                  title={share.sharedWithUserEmail ?? undefined}
                >
                  {share.sharedWithUserEmail ?? "Unknown user"}
                  <span className="text-muted-foreground">
                    {" "}
                    · {share.role === "EDITOR" ? "Editor" : "Viewer"}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Revoke access"
                  disabled={revokeShare.isPending}
                  onClick={() =>
                    revokeShare.mutate({
                      shareId: share.id,
                      resourceType: target.resourceType,
                      resourceId: target.resourceId,
                    })
                  }
                >
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Done
        </Button>
      </DialogFooter>
    </div>
  );
}
