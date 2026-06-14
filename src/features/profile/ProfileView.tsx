"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Languages,
  Loader2,
  MapPin,
  RefreshCw,
  Route,
  Save,
  Sparkles,
  Target,
  UserRound
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/errors";
import type {
  YouthProfileAddressInput,
  YouthProfilePersonalInput,
  YouthProfileSummary
} from "@/types/youth";
import { profileService } from "./service";

const emptyPersonal: YouthProfilePersonalInput = {
  email: "",
  maritalStatus: "",
  emergencyContact: "",
  hasDisability: ""
};

const emptyAddress: YouthProfileAddressInput = {
  physicalAddress: "",
  latitude: "",
  longitude: ""
};

function displayValue(value?: string) {
  return value || "Not provided";
}

function formatStatus(value?: string) {
  if (!value) return "Not set";

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function journeyBadgeClass(status?: string) {
  switch (status?.trim().toLowerCase()) {
    case "engaged":
      return "border-green-200 bg-green-50 text-green-800";
    case "improved":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "transformed":
      return "border-blue-200 bg-blue-50 text-blue-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function ProfileList({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (!items.length) {
    return <p className="mt-2 text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {items.map((item, index) => (
        <li
          className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
          key={`${item}-${index}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ProfileView() {
  const [profile, setProfile] = useState<YouthProfileSummary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [personal, setPersonal] = useState(emptyPersonal);
  const [address, setAddress] = useState(emptyAddress);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [action, setAction] = useState<"personal" | "address" | null>(null);

  const syncProfile = useCallback((nextProfile: YouthProfileSummary | null) => {
    setProfile(nextProfile);
    setLoaded(true);

    if (!nextProfile) return;

    setPersonal({
      email: nextProfile.email ?? "",
      maritalStatus: nextProfile.maritalStatus ?? "",
      emergencyContact: nextProfile.emergencyContact ?? "",
      hasDisability: nextProfile.hasDisability ?? ""
    });
    setAddress({
      physicalAddress: nextProfile.residence?.physicalAddress ?? "",
      latitude: nextProfile.residence?.latitude ?? "",
      longitude: nextProfile.residence?.longitude ?? ""
    });
  }, []);

  const loadProfile = useCallback(async () => {
    setError(null);
    setNotice(null);

    try {
      syncProfile(await profileService.getProfile());
    } catch (caughtError) {
      setLoaded(true);
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to load your profile. Please try again."
      );
    }
  }, [syncProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function savePersonal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAction("personal");
    setError(null);
    setNotice(null);

    try {
      syncProfile(await profileService.updatePersonal(personal));
      setNotice("Personal details updated successfully.");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update personal details. Please try again."
      );
    } finally {
      setAction(null);
    }
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAction("address");
    setError(null);
    setNotice(null);

    try {
      syncProfile(await profileService.updateAddress(address));
      setNotice("Residence address updated successfully.");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update the residence address. Please try again."
      );
    } finally {
      setAction(null);
    }
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-600">
        <Loader2 className="mr-2 animate-spin text-brand-700" size={20} />
        Loading profile
      </div>
    );
  }

  if (!profile && error) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-600" size={28} />
        <h1 className="mt-3 text-lg font-semibold text-ink">Profile unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Button className="mt-5" onClick={loadProfile} variant="secondary">
          <RefreshCw className="mr-2" size={18} />
          Try again
        </Button>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <UserRound className="mx-auto text-brand-700" size={30} />
        <h1 className="mt-3 text-lg font-semibold text-ink">Profile not available</h1>
        <p className="mt-2 text-sm text-slate-600">
          No youth profile is linked to this account yet.
        </p>
      </section>
    );
  }

  const sections = [
    { title: "Occupation", icon: BriefcaseBusiness, items: profile.occupations },
    { title: "Education", icon: BookOpen, items: profile.educations },
    { title: "Skills", icon: Sparkles, items: profile.skills },
    { title: "Languages", icon: Languages, items: profile.languages },
    { title: "Pathways", icon: Route, items: profile.pathways },
    { title: "Wishes", icon: Target, items: profile.wishes },
    { title: "Documents", icon: FileText, items: profile.documents }
  ];
  const missingSections = sections
    .filter(({ items }) => items.length === 0)
    .map(({ title }) => title);

  return (
    <div className="space-y-5">
      <section className="rounded-lg bg-brand-700 p-5 text-white shadow-soft sm:p-6">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="min-w-0">
            <p className="text-sm font-medium text-brand-100">My profile</p>
            <h1 className="mt-1 text-2xl font-semibold">{profile.name}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${journeyBadgeClass(profile.journeyStatus)}`}
              >
                Journey: {formatStatus(profile.journeyStatus)}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                Registration: {formatStatus(profile.registrationStatus)}
              </span>
            </div>
          </div>
          <div className="w-fit rounded-lg bg-white/10 px-4 py-3 text-center sm:justify-self-end">
            <p className="text-2xl font-semibold">{profile.profileCompletion}%</p>
            <p className="text-xs text-brand-100">Profile completion</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${Math.min(100, Math.max(0, profile.profileCompletion))}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-brand-50">
          Complete your profile to improve opportunity matching.
        </p>
      </section>

      {missingSections.length > 0 ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-900">Profile sections to complete</h2>
          <p className="mt-1 text-sm text-amber-800">
            Add {missingSections.join(", ")} to strengthen your youth journey profile.
          </p>
        </section>
      ) : null}

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

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Overview</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="font-medium text-slate-500">Phone</dt><dd className="mt-1 text-ink">{displayValue(profile.phoneNumber)}</dd></div>
          <div><dt className="font-medium text-slate-500">Email</dt><dd className="mt-1 break-all text-ink">{displayValue(profile.email)}</dd></div>
          <div><dt className="font-medium text-slate-500">Birth date</dt><dd className="mt-1 text-ink">{displayValue(profile.birthDate)}</dd></div>
          <div><dt className="font-medium text-slate-500">Gender</dt><dd className="mt-1 text-ink">{displayValue(profile.gender)}</dd></div>
          <div><dt className="font-medium text-slate-500">Marital status</dt><dd className="mt-1 text-ink">{displayValue(profile.maritalStatus)}</dd></div>
          <div><dt className="font-medium text-slate-500">Disability</dt><dd className="mt-1 text-ink">{displayValue(profile.hasDisability)}</dd></div>
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin className="text-brand-700" size={20} />
          <h2 className="text-lg font-semibold text-ink">Residence address</h2>
        </div>
        <p className="mt-3 text-sm text-slate-700">
          {profile.residence?.physicalAddress ?? "Physical address not provided"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {profile.residence?.location ?? "Location not specified"}
        </p>
        {profile.residence?.latitude || profile.residence?.longitude ? (
          <p className="mt-1 text-xs text-slate-500">
            Coordinates: {profile.residence.latitude ?? "-"}, {profile.residence.longitude ?? "-"}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {sections.map(({ title, icon: Icon, items }) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={title}>
            <div className="flex items-center gap-2">
              <Icon className="text-brand-700" size={20} />
              <h2 className="font-semibold text-ink">{title}</h2>
              {title === "Documents" ? (
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {items.length}
                </span>
              ) : null}
            </div>
            <ProfileList items={items} emptyText={`No ${title.toLowerCase()} recorded.`} />
          </article>
        ))}
      </section>

      <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={savePersonal}>
        <div><h2 className="text-lg font-semibold text-ink">Edit personal details</h2><p className="mt-1 text-sm text-slate-600">Update the permitted personal profile fields.</p></div>
        <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Email</span><input className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" onChange={(event) => setPersonal((current) => ({ ...current, email: event.target.value }))} type="email" value={personal.email} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Marital status</span><select className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" onChange={(event) => setPersonal((current) => ({ ...current, maritalStatus: event.target.value }))} required value={personal.maritalStatus}><option value="">Select status</option><option value="Single">Single</option><option value="Married">Married</option><option value="Divorced">Divorced</option><option value="Widowed">Widowed</option></select></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Has disability</span><select className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" onChange={(event) => setPersonal((current) => ({ ...current, hasDisability: event.target.value }))} required value={personal.hasDisability}><option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option></select></label>
        </div>
        <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Emergency contact</span><input className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" onChange={(event) => setPersonal((current) => ({ ...current, emergencyContact: event.target.value }))} required type="tel" value={personal.emergencyContact} /></label>
        <Button className="w-full sm:w-auto" disabled={action !== null} type="submit">{action === "personal" ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Save className="mr-2" size={18} />}Save personal details</Button>
      </form>

      <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={saveAddress}>
        <div><h2 className="text-lg font-semibold text-ink">Edit residence address</h2><p className="mt-1 text-sm text-slate-600">Location selection remains unchanged in this phase.</p></div>
        <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Physical address</span><textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" onChange={(event) => setAddress((current) => ({ ...current, physicalAddress: event.target.value }))} required value={address.physicalAddress} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Latitude</span><input className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" inputMode="decimal" onChange={(event) => setAddress((current) => ({ ...current, latitude: event.target.value }))} placeholder="-6.000000" type="number" step="any" value={address.latitude} /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Longitude</span><input className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" inputMode="decimal" onChange={(event) => setAddress((current) => ({ ...current, longitude: event.target.value }))} placeholder="39.000000" type="number" step="any" value={address.longitude} /></label>
        </div>
        <Button className="w-full sm:w-auto" disabled={action !== null} type="submit">{action === "address" ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Save className="mr-2" size={18} />}Save address</Button>
      </form>
    </div>
  );
}
