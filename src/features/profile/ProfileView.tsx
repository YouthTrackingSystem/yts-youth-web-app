"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  FileText,
  Languages,
  LocateFixed,
  Loader2,
  MapPin,
  RefreshCw,
  Route,
  Save,
  Sparkles,
  Target,
  Upload,
  X,
  UserRound
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/errors";
import { registrationService } from "@/features/auth/registrationService";
import { useTranslation } from "@/hooks/useTranslation";
import type {
  LocationLevel,
  RegistrationApplication,
  SelectOption
} from "@/types/registration";
import type {
  YouthProfileAddressInput,
  YouthProfileOccupationInput,
  YouthProfilePersonalInput,
  YouthProfileWishInput,
  YouthProfileWishesInput,
  YouthProfileSummary
} from "@/types/youth";
import { profileService } from "./service";

const emptyPersonal: YouthProfilePersonalInput = {
  firstName: "",
  middleName: "",
  surname: "",
  birthDate: "",
  gender: "",
  religionId: null,
  email: "",
  maritalStatus: "",
  emergencyContact: "",
  hasDisability: "",
  disabilityTypeId: null
};

const emptyAddress: YouthProfileAddressInput = {
  countryId: null,
  regionId: null,
  districtId: null,
  divisionId: null,
  wardId: null,
  streetId: null,
  physicalAddress: "",
  latitude: "",
  longitude: ""
};

const emptyOccupation: YouthProfileOccupationInput = {
  occupationType: "",
  sectorCategoryId: null,
  occupationSectorId: null
};

const emptyWish: YouthProfileWishInput = {
  interestType: "",
  wishSectorId: null,
  sectorCategoryId: null,
  description: "",
  isPriority: true
};

const emptyWishes: YouthProfileWishesInput = {
  youthWishes: "No",
  wishes: []
};

type LocationOptions = Record<LocationLevel, SelectOption[]>;

const emptyLocationOptions: LocationOptions = {
  country: [],
  region: [],
  district: [],
  division: [],
  ward: [],
  street: []
};

function numberOrNull(value: string) {
  return value === "" ? null : Number(value);
}

function addressKey(level: LocationLevel) {
  return `${level}Id` as const;
}

function displayValue(value?: string) {
  return value || "Not provided";
}

function profileInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "Y";
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
  const { t } = useTranslation();
  const [profile, setProfile] = useState<YouthProfileSummary | null>(null);
  const [registration, setRegistration] = useState<RegistrationApplication | null>(null);
  const [locationOptions, setLocationOptions] = useState<LocationOptions>(emptyLocationOptions);
  const [loaded, setLoaded] = useState(false);
  const [personal, setPersonal] = useState(emptyPersonal);
  const [address, setAddress] = useState(emptyAddress);
  const [occupation, setOccupation] = useState(emptyOccupation);
  const [wishesEditor, setWishesEditor] = useState(emptyWishes);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [action, setAction] = useState<
    "personal" | "address" | "avatar" | "occupation" | "wishes" | null
  >(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const syncProfile = useCallback((nextProfile: YouthProfileSummary | null) => {
    setProfile(nextProfile);
    setLoaded(true);

    if (!nextProfile) return;

    setPersonal({
      firstName: nextProfile.firstName,
      middleName: nextProfile.middleName ?? "",
      surname: nextProfile.surname,
      birthDate: nextProfile.birthDate ?? "",
      gender: nextProfile.gender ?? "",
      religionId: nextProfile.religionId,
      email: nextProfile.email ?? "",
      maritalStatus: nextProfile.maritalStatus ?? "",
      emergencyContact: nextProfile.emergencyContact ?? "",
      hasDisability: nextProfile.hasDisability ?? "",
      disabilityTypeId: nextProfile.disabilityTypeId
    });
    setAddress({
      countryId: nextProfile.residence?.countryId ?? null,
      regionId: nextProfile.residence?.regionId ?? null,
      districtId: nextProfile.residence?.districtId ?? null,
      divisionId: nextProfile.residence?.divisionId ?? null,
      wardId: nextProfile.residence?.wardId ?? null,
      streetId: nextProfile.residence?.streetId ?? null,
      physicalAddress: nextProfile.residence?.physicalAddress ?? "",
      latitude: nextProfile.residence?.latitude ?? "",
      longitude: nextProfile.residence?.longitude ?? ""
    });
    setOccupation(nextProfile.occupationEditor);
    setWishesEditor({
      youthWishes: nextProfile.wishesEditor.youthWishes,
      wishes:
        nextProfile.wishesEditor.youthWishes === "Yes" && !nextProfile.wishesEditor.wishes.length
          ? [{ ...emptyWish }]
          : nextProfile.wishesEditor.wishes
    });
  }, []);

  const loadLocationOptions = useCallback(async (nextAddress: YouthProfileAddressInput) => {
    const options: LocationOptions = {
      ...emptyLocationOptions,
      country: await registrationService.countries()
    };

    if (nextAddress.countryId) {
      options.region = await registrationService.regions(nextAddress.countryId);
    }
    if (nextAddress.regionId) {
      options.district = await registrationService.districts(nextAddress.regionId);
    }
    if (nextAddress.districtId) {
      options.division = await registrationService.divisions(nextAddress.districtId);
    }
    if (nextAddress.divisionId) {
      options.ward = await registrationService.wards(nextAddress.divisionId);
    }
    if (nextAddress.wardId) {
      options.street = await registrationService.streets(nextAddress.wardId);
    }

    setLocationOptions(options);
  }, []);

  const loadProfile = useCallback(async () => {
    setError(null);
    setNotice(null);

    try {
      const [nextProfile, nextRegistration] = await Promise.all([
        profileService.getProfile(),
        registrationService.get()
      ]);

      syncProfile(nextProfile);
      setRegistration(nextRegistration);
      setPersonal((current) => ({
        ...current,
        disabilityTypeId: nextRegistration.socio_economic.disability_type_id
      }));

      if (nextProfile?.residence) {
        await loadLocationOptions({
          countryId: nextProfile.residence.countryId,
          regionId: nextProfile.residence.regionId,
          districtId: nextProfile.residence.districtId,
          divisionId: nextProfile.residence.divisionId,
          wardId: nextProfile.residence.wardId,
          streetId: nextProfile.residence.streetId,
          physicalAddress: nextProfile.residence.physicalAddress ?? "",
          latitude: nextProfile.residence.latitude ?? "",
          longitude: nextProfile.residence.longitude ?? ""
        });
      }
    } catch (caughtError) {
      setLoaded(true);
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to load your profile. Please try again."
      );
    }
  }, [loadLocationOptions, syncProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  function clearAvatarSelection() {
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarFile(null);
    setAvatarPreviewUrl(null);
  }

  function selectAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setNotice(null);
  }

  function isLocationEditable(level: LocationLevel) {
    return Boolean(registration?.scope.editable_levels.includes(level));
  }

  async function updateLocationLevel(level: LocationLevel, value: number | null) {
    const levels: LocationLevel[] = ["country", "region", "district", "division", "ward", "street"];
    const start = levels.indexOf(level);
    const nextAddress = { ...address, [addressKey(level)]: value };
    const nextOptions = { ...locationOptions };

    levels.slice(start + 1).forEach((childLevel) => {
      Object.assign(nextAddress, { [addressKey(childLevel)]: null });
      nextOptions[childLevel] = [];
    });

    setAddress(nextAddress);
    setLocationOptions(nextOptions);

    if (!value || level === "street") {
      return;
    }

    const childLevel = levels[start + 1];
    const childOptions =
      level === "country"
        ? await registrationService.regions(value)
        : level === "region"
          ? await registrationService.districts(value)
          : level === "district"
            ? await registrationService.divisions(value)
            : level === "division"
              ? await registrationService.wards(value)
              : await registrationService.streets(value);

    setLocationOptions((current) => ({
      ...current,
      [childLevel]: childOptions
    }));
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return;
    }

    setIsDetectingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAddress((current) => ({
          ...current,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude)
        }));
        setIsDetectingLocation(false);
      },
      () => {
        setError("Unable to detect your location. Check location permissions and try again.");
        setIsDetectingLocation(false);
      }
    );
  }

  async function uploadAvatar() {
    if (!avatarFile) return;

    setAction("avatar");
    setError(null);
    setNotice(null);

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      syncProfile(await profileService.uploadAvatar(formData));
      clearAvatarSelection();
      setNotice("Profile photo updated successfully.");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to upload the profile photo. Please try again."
      );
    } finally {
      setAction(null);
    }
  }

  async function savePersonal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAction("personal");
    setError(null);
    setNotice(null);

    try {
      syncProfile(await profileService.updatePersonal(personal));
      setPersonal((current) => ({
        ...current,
        disabilityTypeId: personal.hasDisability === "Yes" ? personal.disabilityTypeId : null
      }));
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

  async function saveOccupation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAction("occupation");
    setError(null);
    setNotice(null);

    try {
      syncProfile(await profileService.updateOccupation(occupation));
      setNotice("Occupation details updated successfully.");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update occupation details. Please try again."
      );
    } finally {
      setAction(null);
    }
  }

  async function saveWishes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAction("wishes");
    setError(null);
    setNotice(null);

    try {
      syncProfile(await profileService.updateWishes(wishesEditor));
      setNotice("Youth wishes updated successfully.");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to update youth wishes. Please try again."
      );
    } finally {
      setAction(null);
    }
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-600">
        <Loader2 className="mr-2 animate-spin text-brand-700" size={20} />
        {t("common.loading")} {t("nav.profile").toLowerCase()}
      </div>
    );
  }

  if (!profile && error) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-600" size={28} />
        <h1 className="mt-3 text-lg font-semibold text-ink">{t("profile.unavailable")}</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Button className="mt-5" onClick={loadProfile} variant="secondary">
          <RefreshCw className="mr-2" size={18} />
          {t("common.tryAgain")}
        </Button>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <UserRound className="mx-auto text-brand-700" size={30} />
        <h1 className="mt-3 text-lg font-semibold text-ink">{t("profile.notAvailable")}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {t("profile.noLinkedProfile")}
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
  const disabilityTypeName = registration?.options.disability_types.find(
    (item) => item.id === personal.disabilityTypeId
  )?.name;
  const religions = profile.options.religions.length
    ? profile.options.religions
    : (registration?.options.religions ?? []).map((option) => ({
        ...option,
        categoryId: null
      }));
  const sectorCategories = profile.options.sectorCategories.length
    ? profile.options.sectorCategories
    : (registration?.options.sector_categories ?? []).map((option) => ({
        ...option,
        categoryId: null
      }));
  const occupationSectors = profile.options.occupationSectors.length
    ? profile.options.occupationSectors
    : (registration?.options.occupation_sectors ?? []).map((option) => ({
        id: option.id,
        name: option.name,
        categoryId: option.category_id
      }));
  const occupationTypes = profile.options.occupationTypes;
  const interestTypes = profile.options.interestTypes;
  const occupationUsesSector =
    occupation.occupationType !== "" && occupation.occupationType !== "Unemployed";
  const filteredOccupationSectors = occupationSectors.filter(
    (sector) => !occupation.sectorCategoryId || sector.categoryId === occupation.sectorCategoryId
  );
  const wish = wishesEditor.wishes[0] ?? emptyWish;
  const filteredWishSectors = occupationSectors.filter(
    (sector) => !wish.sectorCategoryId || sector.categoryId === wish.sectorCategoryId
  );

  return (
    <div className="space-y-5">
      <section className="rounded-lg bg-brand-700 p-5 text-white shadow-soft sm:p-6">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
            <div className="shrink-0">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/25 bg-white/15 text-2xl font-semibold text-white">
                {avatarPreviewUrl || profile.avatarUrl ? (
                  // A plain image supports backend-provided absolute or relative avatar URLs.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={`${profile.name} profile`}
                    className="h-full w-full object-cover"
                    src={avatarPreviewUrl ?? profile.avatarUrl}
                  />
                ) : (
                  profileInitials(profile.name)
                )}
              </div>
              <label className="mt-2 inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20">
                <Camera className="mr-1.5" size={15} />
                {profile.avatarUrl ? "Change photo" : "Upload photo"}
                <input
                  accept="image/*"
                  className="sr-only"
                  disabled={action !== null}
                  onChange={selectAvatar}
                  type="file"
                />
              </label>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-brand-100">{t("profile.title")}</p>
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
          </div>
          <div className="w-fit rounded-lg bg-white/10 px-4 py-3 text-center sm:justify-self-end">
            <p className="text-2xl font-semibold">{profile.profileCompletion}%</p>
            <p className="text-xs text-brand-100">{t("profile.completion")}</p>
          </div>
        </div>

        {avatarFile ? (
          <div className="mt-4 flex flex-col gap-2 rounded-md border border-white/20 bg-white/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="truncate text-sm text-brand-50">Selected: {avatarFile.name}</p>
            <div className="flex gap-2">
              <button
                className="inline-flex min-h-9 flex-1 items-center justify-center rounded-md border border-white/30 px-3 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-60 sm:flex-none"
                disabled={action !== null}
                onClick={clearAvatarSelection}
                type="button"
              >
                <X className="mr-1.5" size={15} />
                Cancel
              </button>
              <button
                className="inline-flex min-h-9 flex-1 items-center justify-center rounded-md bg-white px-3 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-60 sm:flex-none"
                disabled={action !== null}
                onClick={uploadAvatar}
                type="button"
              >
                {action === "avatar" ? (
                  <Loader2 className="mr-1.5 animate-spin" size={15} />
                ) : (
                  <Upload className="mr-1.5" size={15} />
                )}
                Upload photo
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${Math.min(100, Math.max(0, profile.profileCompletion))}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-brand-50">
          {t("profile.completionHelp")}
        </p>
      </section>

      {missingSections.length > 0 ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-900">{t("profile.sectionsToComplete")}</h2>
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
        <h2 className="text-lg font-semibold text-ink">{t("profile.overview")}</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="font-medium text-slate-500">Phone</dt><dd className="mt-1 text-ink">{displayValue(profile.phoneNumber)}</dd></div>
          <div><dt className="font-medium text-slate-500">Email</dt><dd className="mt-1 break-all text-ink">{displayValue(profile.email)}</dd></div>
          <div><dt className="font-medium text-slate-500">Birth date</dt><dd className="mt-1 text-ink">{displayValue(profile.birthDate)}</dd></div>
          <div><dt className="font-medium text-slate-500">Gender</dt><dd className="mt-1 text-ink">{displayValue(profile.gender)}</dd></div>
          <div><dt className="font-medium text-slate-500">Marital status</dt><dd className="mt-1 text-ink">{displayValue(profile.maritalStatus)}</dd></div>
          <div><dt className="font-medium text-slate-500">Disability</dt><dd className="mt-1 text-ink">{profile.hasDisability === "Yes" && disabilityTypeName ? `Yes / ${disabilityTypeName}` : displayValue(profile.hasDisability)}</dd></div>
          <div><dt className="font-medium text-slate-500">Occupation</dt><dd className="mt-1 text-ink">{profile.occupations.length ? profile.occupations.join(", ") : "Not provided"}</dd></div>
          <div><dt className="font-medium text-slate-500">Youth wishes</dt><dd className="mt-1 text-ink">{profile.wishes.length ? profile.wishes.join(", ") : "Not provided"}</dd></div>
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin className="text-brand-700" size={20} />
          <h2 className="text-lg font-semibold text-ink">{t("profile.residenceAddress")}</h2>
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

      <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={saveOccupation}>
        <div>
          <h2 className="text-lg font-semibold text-ink">{t("profile.editOccupation")}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Update your work status and sector so opportunity matching stays useful.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Occupation type/status</span>
            <select
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              disabled={action !== null}
              onChange={(event) =>
                setOccupation((current) => ({
                  ...current,
                  occupationType: event.target.value,
                  sectorCategoryId: event.target.value === "Unemployed" ? null : current.sectorCategoryId,
                  occupationSectorId: event.target.value === "Unemployed" ? null : current.occupationSectorId
                }))
              }
              required
              value={occupation.occupationType}
            >
              <option value="">Select occupation</option>
              {occupationTypes.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          {occupationUsesSector ? (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Sector category</span>
                <select
                  className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  disabled={action !== null}
                  onChange={(event) =>
                    setOccupation((current) => ({
                      ...current,
                      sectorCategoryId: numberOrNull(event.target.value),
                      occupationSectorId: null
                    }))
                  }
                  required
                  value={occupation.sectorCategoryId ?? ""}
                >
                  <option value="">Select category</option>
                  {sectorCategories.map((option) => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Occupation sector</span>
                <select
                  className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
                  disabled={action !== null || !occupation.sectorCategoryId}
                  onChange={(event) =>
                    setOccupation((current) => ({
                      ...current,
                      occupationSectorId: numberOrNull(event.target.value)
                    }))
                  }
                  required
                  value={occupation.occupationSectorId ?? ""}
                >
                  <option value="">Select sector</option>
                  {filteredOccupationSectors.map((option) => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </label>
            </>
          ) : null}
        </div>
        <Button className="w-full sm:w-auto" disabled={action !== null} type="submit">
          {action === "occupation" ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Save className="mr-2" size={18} />}
          {t("profile.saveOccupation")}
        </Button>
      </form>

      <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={saveWishes}>
        <div>
          <h2 className="text-lg font-semibold text-ink">{t("profile.editWishes")}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Tell YTS what opportunities you want to pursue next.
          </p>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Do you have wishes/interests?</span>
          <select
            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            disabled={action !== null}
            onChange={(event) =>
              setWishesEditor({
                youthWishes: event.target.value,
                wishes: event.target.value === "Yes" ? [wishesEditor.wishes[0] ?? { ...emptyWish }] : []
              })
            }
            required
            value={wishesEditor.youthWishes}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </label>
        {wishesEditor.youthWishes === "Yes" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Interest type</span>
              <select
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                disabled={action !== null}
                onChange={(event) =>
                  setWishesEditor((current) => ({
                    ...current,
                    wishes: [{ ...wish, interestType: event.target.value }]
                  }))
                }
                required
                value={wish.interestType}
              >
                <option value="">Select interest</option>
                {interestTypes.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Wish sector category</span>
              <select
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                disabled={action !== null}
                onChange={(event) =>
                  setWishesEditor((current) => ({
                    ...current,
                    wishes: [
                      {
                        ...wish,
                        sectorCategoryId: numberOrNull(event.target.value),
                        wishSectorId: null
                      }
                    ]
                  }))
                }
                required
                value={wish.sectorCategoryId ?? ""}
              >
                <option value="">Select category</option>
                {sectorCategories.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Wish sector</span>
              <select
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
                disabled={action !== null || !wish.sectorCategoryId}
                onChange={(event) =>
                  setWishesEditor((current) => ({
                    ...current,
                    wishes: [{ ...wish, wishSectorId: numberOrNull(event.target.value) }]
                  }))
                }
                required
                value={wish.wishSectorId ?? ""}
              >
                <option value="">Select sector</option>
                {filteredWishSectors.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Wish description</span>
              <textarea
                className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                disabled={action !== null}
                onChange={(event) =>
                  setWishesEditor((current) => ({
                    ...current,
                    wishes: [{ ...wish, description: event.target.value }]
                  }))
                }
                placeholder="Example: I am interested in organic farming or greenhouse management."
                value={wish.description}
              />
            </label>
          </div>
        ) : null}
        <Button className="w-full sm:w-auto" disabled={action !== null} type="submit">
          {action === "wishes" ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Save className="mr-2" size={18} />}
          {t("profile.saveWishes")}
        </Button>
      </form>

      <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={savePersonal}>
        <div>
          <h2 className="text-lg font-semibold text-ink">{t("profile.editPersonal")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("profile.editPersonalHelp")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{t("profile.primaryPhone")}</span>
            <input
              className="h-11 w-full rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-700 outline-none"
              readOnly
              type="tel"
              value={profile.phoneNumber ?? ""}
            />
            <span className="mt-1 block text-xs text-slate-500">
              {t("profile.phoneLocked")}
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{t("profile.email")}</span>
            <input
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => setPersonal((current) => ({ ...current, email: event.target.value }))}
              type="email"
              value={personal.email}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{t("profile.gender")}</span>
            <select
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => setPersonal((current) => ({ ...current, gender: event.target.value }))}
              required
              value={personal.gender}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{t("profile.religion")}</span>
            <select
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => setPersonal((current) => ({ ...current, religionId: numberOrNull(event.target.value) }))}
              required
              value={personal.religionId ?? ""}
            >
              <option value="">Select religion</option>
              {religions.map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{t("profile.maritalStatus")}</span>
            <select
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => setPersonal((current) => ({ ...current, maritalStatus: event.target.value }))}
              required
              value={personal.maritalStatus}
            >
              <option value="">Select status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
              <option value="Widow/Widower">Widow/Widower</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{t("profile.hasDisability")}</span>
            <select
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => setPersonal((current) => ({ ...current, hasDisability: event.target.value, disabilityTypeId: event.target.value === "Yes" ? current.disabilityTypeId : null }))}
              required
              value={personal.hasDisability}
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </label>
        </div>
        {personal.hasDisability === "Yes" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{t("profile.disabilityType")}</span>
            <select
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => setPersonal((current) => ({ ...current, disabilityTypeId: numberOrNull(event.target.value) }))}
              required
              value={personal.disabilityTypeId ?? ""}
            >
              <option value="">Select disability type</option>
              {registration?.options.disability_types.map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">{t("profile.emergencyContact")}</span><input className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" onChange={(event) => setPersonal((current) => ({ ...current, emergencyContact: event.target.value }))} required type="tel" value={personal.emergencyContact} /></label>
        <Button className="w-full sm:w-auto" disabled={action !== null} type="submit">{action === "personal" ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Save className="mr-2" size={18} />}{t("profile.savePersonal")}</Button>
      </form>

      <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={saveAddress}>
        <div>
          <h2 className="text-lg font-semibold text-ink">{t("profile.editAddress")}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Update your residence within your assigned {registration?.scope.assigned_level ?? "location"} scope.
          </p>
        </div>
        <div className="rounded-md border border-brand-100 bg-brand-50 p-3 text-sm text-brand-700">
          You can change: {registration?.scope.editable_levels.join(", ") || "assigned location only"}.
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["country", "region", "district", "division", "ward", "street"] as LocationLevel[]).map((level) => (
            <label className="block" key={level}>
              <span className="mb-2 block text-sm font-medium capitalize text-slate-700">{level}</span>
              <select
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
                disabled={action !== null || !isLocationEditable(level)}
                onChange={(event) => void updateLocationLevel(level, numberOrNull(event.target.value))}
                required
                value={address[addressKey(level)] ?? ""}
              >
                <option value="">Select {level}</option>
                {locationOptions[level].map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Physical address</span><textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" onChange={(event) => setAddress((current) => ({ ...current, physicalAddress: event.target.value }))} required value={address.physicalAddress} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Latitude</span><input className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" inputMode="decimal" onChange={(event) => setAddress((current) => ({ ...current, latitude: event.target.value }))} placeholder="-6.000000" type="number" step="any" value={address.latitude} /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Longitude</span><input className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" inputMode="decimal" onChange={(event) => setAddress((current) => ({ ...current, longitude: event.target.value }))} placeholder="39.000000" type="number" step="any" value={address.longitude} /></label>
        </div>
        <Button disabled={action !== null || isDetectingLocation} onClick={detectLocation} type="button" variant="secondary">
          {isDetectingLocation ? <Loader2 className="mr-2 animate-spin" size={18} /> : <LocateFixed className="mr-2" size={18} />}
          Use current GPS location
        </Button>
        <Button className="w-full sm:w-auto" disabled={action !== null} type="submit">{action === "address" ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Save className="mr-2" size={18} />}{t("profile.saveAddress")}</Button>
      </form>
    </div>
  );
}
