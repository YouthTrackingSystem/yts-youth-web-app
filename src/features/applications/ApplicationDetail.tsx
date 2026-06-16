"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Save,
  Send,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/errors";
import type {
  YouthApplicationDraftInput,
  YouthApplicationSummary
} from "@/types/youth";
import {
  applicationStatusBadgeClass,
  formatApplicationDate
} from "./formatters";
import { applicationsService } from "./service";

type ApplicationDetailProps = {
  id: string;
};

const emptyDraft: YouthApplicationDraftInput = {
  coverNote: "",
  portfolioUrl: "",
  notes: ""
};

export function ApplicationDetail({ id }: ApplicationDetailProps) {
  const [application, setApplication] = useState<YouthApplicationSummary | null>(null);
  const [draft, setDraft] = useState<YouthApplicationDraftInput>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [action, setAction] = useState<"save" | "submit" | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvAction, setCvAction] = useState<"upload" | "download" | null>(null);

  const syncApplication = useCallback((nextApplication: YouthApplicationSummary) => {
    setApplication(nextApplication);
    setDraft({
      coverNote: nextApplication.coverNote ?? "",
      portfolioUrl: nextApplication.portfolioUrl ?? "",
      notes: nextApplication.notes ?? ""
    });
  }, []);

  const loadApplication = useCallback(async () => {
    setError(null);
    setNotice(null);

    try {
      syncApplication(await applicationsService.getById(id));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to load this application. Please try again."
      );
    }
  }, [id, syncApplication]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  function updateDraft(field: keyof YouthApplicationDraftInput, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function selectCv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const isAcceptedType =
      file.type === "application/pdf" ||
      file.type === "application/msword" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      /\.(pdf|doc|docx)$/i.test(file.name);

    if (!isAcceptedType) {
      setError("Please select a PDF, DOC, or DOCX file.");
      return;
    }

    setCvFile(file);
    setError(null);
    setNotice(null);
  }

  async function uploadCv() {
    if (!cvFile) return;

    setCvAction("upload");
    setError(null);
    setNotice(null);

    const formData = new FormData();
    formData.append("cv_file", cvFile);

    try {
      syncApplication(await applicationsService.uploadCv(id, formData));
      setCvFile(null);
      setNotice("CV uploaded successfully.");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to upload CV. Please try again."
      );
    } finally {
      setCvAction(null);
    }
  }

  async function downloadCv() {
    setCvAction("download");
    setError(null);
    setNotice(null);

    try {
      const cvBlob = await applicationsService.downloadCv(id);
      const url = URL.createObjectURL(cvBlob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to download CV. Please try again."
      );
    } finally {
      setCvAction(null);
    }
  }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const nextAction = submitter?.value === "submit" ? "submit" : "save";

    if (
      nextAction === "submit" &&
      !window.confirm(
        "Submit this application? You will not be able to edit it afterward."
      )
    ) {
      return;
    }

    setAction(nextAction);
    setError(null);
    setNotice(null);

    try {
      const savedApplication = await applicationsService.updateDraft(id, draft);

      if (nextAction === "submit") {
        syncApplication(await applicationsService.submitDraft(id));
        setNotice("Application submitted successfully.");
      } else {
        syncApplication(savedApplication);
        setNotice("Draft saved successfully.");
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : nextAction === "submit"
            ? "Unable to submit this application. Please try again."
            : "Unable to save this draft. Please try again."
      );
    } finally {
      setAction(null);
    }
  }

  if (!application && !error) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-600">
        <Loader2 className="mr-2 animate-spin text-brand-700" size={20} />
        Loading application
      </div>
    );
  }

  if (!application && error) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-600" size={28} />
        <h1 className="mt-3 text-lg font-semibold text-ink">Application unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Button className="mt-5" onClick={loadApplication} variant="secondary">
          <RefreshCw className="mr-2" size={18} />
          Try again
        </Button>
      </section>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <div className="space-y-5">
      <Link
        className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800"
        href="/applications"
      >
        <ArrowLeft className="mr-2" size={18} />
        Back to applications
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              {application.opportunityTitle}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {application.stakeholderName}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${applicationStatusBadgeClass(application.statusCode)}`}
          >
            {application.statusLabel}
          </span>
        </div>

        <dl className="mt-5 grid gap-4 border-t border-slate-200 pt-5 text-sm sm:grid-cols-2">
          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 shrink-0 text-brand-700" size={19} />
            <div>
              <dt className="font-semibold text-ink">Applied at</dt>
              <dd className="mt-1 text-slate-600">
                {formatApplicationDate(application.appliedAt)}
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 shrink-0 text-brand-700" size={19} />
            <div>
              <dt className="font-semibold text-ink">Decision at</dt>
              <dd className="mt-1 text-slate-600">
                {formatApplicationDate(application.decisionAt)}
              </dd>
            </div>
          </div>
        </dl>
      </section>

      {notice ? (
        <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
          <p>{notice}</p>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <p>{error}</p>
        </div>
      ) : null}

      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 shrink-0 text-brand-700" size={22} />
          <div>
            <h2 className="text-lg font-semibold text-ink">CV</h2>
            <p className="mt-1 text-sm text-slate-600">
              {application.hasCv ? "CV uploaded" : "No CV uploaded"}
            </p>
          </div>
        </div>

        {application.hasCv ? (
          <Button
            className="w-full sm:w-auto"
            disabled={cvAction !== null}
            onClick={downloadCv}
            variant="secondary"
          >
            {cvAction === "download" ? (
              <Loader2 className="mr-2 animate-spin" size={18} />
            ) : (
              <Download className="mr-2" size={18} />
            )}
            Download/View CV
          </Button>
        ) : null}

        {application.isDraft ? (
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Upload CV
              </span>
              <input
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
                disabled={cvAction !== null}
                onChange={selectCv}
                type="file"
              />
            </label>

            {cvFile ? (
              <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                Selected: {cvFile.name}
              </div>
            ) : null}

            <Button
              className="w-full sm:w-auto"
              disabled={!cvFile || cvAction !== null}
              onClick={uploadCv}
              type="button"
            >
              {cvAction === "upload" ? (
                <Loader2 className="mr-2 animate-spin" size={18} />
              ) : (
                <Upload className="mr-2" size={18} />
              )}
              Upload CV
            </Button>
          </div>
        ) : null}
      </section>

      {application.isDraft ? (
        <form
          className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          onSubmit={handleFormSubmit}
        >
          <div>
            <h2 className="text-lg font-semibold text-ink">Edit draft</h2>
            <p className="mt-1 text-sm text-slate-600">
              Save your changes or submit when the application is ready.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Cover note
            </span>
            <textarea
              className="min-h-36 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => updateDraft("coverNote", event.target.value)}
              required
              value={draft.coverNote}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Portfolio URL
            </span>
            <input
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => updateDraft("portfolioUrl", event.target.value)}
              placeholder="https://example.com/portfolio"
              type="url"
              value={draft.portfolioUrl}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Notes</span>
            <textarea
              className="min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => updateDraft("notes", event.target.value)}
              value={draft.notes}
            />
          </label>

          <div className="grid gap-3 sm:flex sm:justify-end">
            <Button
              disabled={action !== null}
              name="intent"
              type="submit"
              value="save"
              variant="secondary"
            >
              {action === "save" ? (
                <Loader2 className="mr-2 animate-spin" size={18} />
              ) : (
                <Save className="mr-2" size={18} />
              )}
              Save draft
            </Button>
            <Button
              disabled={action !== null}
              name="intent"
              type="submit"
              value="submit"
            >
              {action === "submit" ? (
                <Loader2 className="mr-2 animate-spin" size={18} />
              ) : (
                <Send className="mr-2" size={18} />
              )}
              Submit application
            </Button>
          </div>
        </form>
      ) : (
        <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-sm font-semibold text-ink">Cover note</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
              {application.coverNote ?? "No cover note provided."}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink">Portfolio URL</h2>
            {application.portfolioUrl ? (
              <a
                className="mt-2 block break-all text-sm font-medium text-brand-700 hover:underline"
                href={application.portfolioUrl}
                rel="noreferrer"
                target="_blank"
              >
                {application.portfolioUrl}
              </a>
            ) : (
              <p className="mt-2 text-sm text-slate-600">Not provided</p>
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink">Notes</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
              {application.notes ?? "No notes provided."}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
