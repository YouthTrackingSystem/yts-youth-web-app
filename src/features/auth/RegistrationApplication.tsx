"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  LocateFixed,
  LogOut,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Send,
  UserRound
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { ApiError } from "@/lib/api/errors";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { YouthSessionState } from "@/types/auth";
import type {
  ContactStep,
  LocationLevel,
  LocationStep,
  PersonalStep,
  RegistrationApplication as RegistrationData,
  SelectOption,
  SocioEconomicStep
} from "@/types/registration";
import { authService } from "./service";
import { registrationService } from "./registrationService";

const steps = [
  { labelKey: "registration.personal", icon: UserRound },
  { labelKey: "registration.contact", icon: Phone },
  { labelKey: "registration.location", icon: MapPin },
  { labelKey: "registration.socioEconomic", icon: BriefcaseBusiness },
  { labelKey: "registration.review", icon: ClipboardCheck }
] as const;

const locationTranslationKeys: Record<LocationLevel, TranslationKey> = {
  country: "profile.country",
  region: "profile.region",
  district: "profile.district",
  division: "profile.division",
  ward: "profile.ward",
  street: "profile.street"
};

const inputClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
const labelClass = "mb-2 block text-sm font-medium text-slate-700";

const emptyPersonal: PersonalStep = {
  first_name: "",
  middle_name: "",
  surname: "",
  birth_date: "",
  gender: ""
};
const emptyContact: ContactStep = { primary_phone: "", email: "", emergency_contact: "" };
const emptyLocation: LocationStep = {
  country_id: null,
  region_id: null,
  district_id: null,
  division_id: null,
  ward_id: null,
  street_id: null,
  physical_address: "",
  latitude: null,
  longitude: null,
  names: { country: null, region: null, district: null, division: null, ward: null, street: null }
};
const emptySocio: SocioEconomicStep = {
  religion_id: null,
  marital_status: "",
  occupation_type: "",
  occupation_sector_id: null,
  has_disability: "",
  disability_type_id: null,
  youth_wishes: "No",
  wishes: []
};

const emptyWish = {
  interest_type: "",
  wish_sector_id: null,
  sector_category_id: null,
  description: ""
};

type LocationOptions = Record<LocationLevel, SelectOption[]>;
type Action = "load" | "personal" | "contact" | "location" | "socio" | "submit" | "logout" | null;

function numberOrNull(value: string) {
  return value ? Number(value) : null;
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    const validationMessage = error.errors ? Object.values(error.errors).flat()[0] : undefined;
    return validationMessage ?? error.message;
  }

  return error instanceof Error ? error.message : fallback;
}

function normalize(data: RegistrationData) {
  return {
    personal: {
      first_name: data.personal.first_name ?? "",
      middle_name: data.personal.middle_name ?? "",
      surname: data.personal.surname ?? "",
      birth_date: data.personal.birth_date ?? "",
      gender: data.personal.gender ?? ""
    },
    contact: {
      primary_phone: data.contact.primary_phone ?? "",
      email: data.contact.email ?? "",
      emergency_contact: data.contact.emergency_contact ?? ""
    },
    location: {
      ...data.location,
      physical_address: data.location.physical_address ?? ""
    },
    socio: {
      religion_id: data.socio_economic.religion_id,
      marital_status: data.socio_economic.marital_status ?? "",
      occupation_type: data.socio_economic.occupation_type ?? "",
      occupation_sector_id: data.socio_economic.occupation_sector_id,
      has_disability: data.socio_economic.has_disability ?? "",
      disability_type_id: data.socio_economic.disability_type_id,
      youth_wishes: data.socio_economic.youth_wishes ?? "No",
      wishes: data.socio_economic.wishes.length ? data.socio_economic.wishes : [{ ...emptyWish }]
    }
  };
}

export function RegistrationApplication() {
  const router = useRouter();
  const { t } = useTranslation();
  const [session, setSession] = useState<YouthSessionState | null>(null);
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [personal, setPersonal] = useState<PersonalStep>(emptyPersonal);
  const [contact, setContact] = useState<ContactStep>(emptyContact);
  const [location, setLocation] = useState<LocationStep>(emptyLocation);
  const [socio, setSocio] = useState<SocioEconomicStep>(emptySocio);
  const [locationOptions, setLocationOptions] = useState<LocationOptions>({
    country: [], region: [], district: [], division: [], ward: [], street: []
  });
  const [step, setStep] = useState(0);
  const [action, setAction] = useState<Action>("load");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const hydrate = useCallback((data: RegistrationData) => {
    const values = normalize(data);
    setRegistration(data);
    setPersonal(values.personal);
    setContact(values.contact);
    setLocation(values.location);
    setSocio(values.socio);
  }, []);

  const loadLocationOptions = useCallback(async (data: RegistrationData) => {
    const options: LocationOptions = {
      country: await registrationService.countries(),
      region: [], district: [], division: [], ward: [], street: []
    };

    if (data.location.country_id) options.region = await registrationService.regions(data.location.country_id);
    if (data.location.region_id) options.district = await registrationService.districts(data.location.region_id);
    if (data.location.district_id) options.division = await registrationService.divisions(data.location.district_id);
    if (data.location.division_id) options.ward = await registrationService.wards(data.location.division_id);
    if (data.location.ward_id) options.street = await registrationService.streets(data.location.ward_id);
    setLocationOptions(options);
  }, []);

  const load = useCallback(async () => {
    setAction("load");
    setError(null);

    try {
      const nextSession = await authService.getSession();
      setSession(nextSession);

      if (nextSession.status === "unauthenticated") {
        router.replace("/login");
        return;
      }

      if (nextSession.status === "authenticated") {
        router.replace("/dashboard");
        return;
      }

      if (nextSession.status !== "blocked") {
        return;
      }

      if (nextSession.reason === "not_whitelisted" || nextSession.reason === "awaiting_approval") {
        return;
      }

      const data = await registrationService.get();
      hydrate(data);
      await loadLocationOptions(data);
    } catch (caughtError) {
      setError(errorMessage(caughtError, t("common.somethingWrong")));
    } finally {
      setAction(null);
    }
  }, [hydrate, loadLocationOptions, router, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleLogout() {
    setAction("logout");
    await authService.logout().catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }

  async function saveCurrentStep(moveForward = false) {
    if (!registration || step === 4) return;
    setError(null);
    setNotice(null);
    const actionName: Action = step === 0 ? "personal" : step === 1 ? "contact" : step === 2 ? "location" : "socio";
    setAction(actionName);

    try {
      const response = step === 0
        ? await registrationService.savePersonal(personal)
        : step === 1
          ? await registrationService.saveContact({ email: contact.email, emergency_contact: contact.emergency_contact })
          : step === 2
            ? await registrationService.saveLocation({
                country_id: location.country_id,
                region_id: location.region_id,
                district_id: location.district_id,
                division_id: location.division_id,
                ward_id: location.ward_id,
                street_id: location.street_id,
                physical_address: location.physical_address,
                latitude: location.latitude === "" ? null : location.latitude,
                longitude: location.longitude === "" ? null : location.longitude
              })
            : await registrationService.saveSocioEconomic(socio);

      hydrate(response.registration);
      setNotice(t("registration.saved"));
      if (moveForward) setStep((current) => Math.min(4, current + 1));
    } catch (caughtError) {
      setError(errorMessage(caughtError, t("common.somethingWrong")));
    } finally {
      setAction(null);
    }
  }

  async function submit() {
    setAction("submit");
    setError(null);
    setNotice(null);

    try {
      const response = await registrationService.submit();
      hydrate(response.registration);
      setNotice(t("registration.submittedSuccess"));
    } catch (caughtError) {
      setError(errorMessage(caughtError, t("common.somethingWrong")));
    } finally {
      setAction(null);
    }
  }

  async function updateLocationLevel(level: LocationLevel, value: number | null) {
    const levels: LocationLevel[] = ["country", "region", "district", "division", "ward", "street"];
    const index = levels.indexOf(level);
    const next = { ...location, [`${level}_id`]: value } as LocationStep;
    for (const child of levels.slice(index + 1)) {
      Object.assign(next, { [`${child}_id`]: null });
    }
    setLocation(next);

    setLocationOptions((current) => {
      const updated = { ...current };
      for (const child of levels.slice(index + 1)) updated[child] = [];
      return updated;
    });

    if (!value || level === "street") return;
    const child = levels[index + 1];
    const options = level === "country"
      ? await registrationService.regions(value)
      : level === "region"
        ? await registrationService.districts(value)
        : level === "district"
          ? await registrationService.divisions(value)
          : level === "division"
            ? await registrationService.wards(value)
            : await registrationService.streets(value);
    setLocationOptions((current) => ({ ...current, [child]: options }));
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setError(t("registration.locationUnsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation((current) => ({
        ...current,
        latitude: coords.latitude.toFixed(7),
        longitude: coords.longitude.toFixed(7)
      })),
      () => setError(t("registration.locationError"))
    );
  }

  const reviewLocation = useMemo(() => {
    const name = (level: LocationLevel) =>
      locationOptions[level].find((item) => item.id === location[`${level}_id`])?.name
      ?? location.names[level]
      ?? "-";
    return ["country", "region", "district", "division", "ward", "street"]
      .map((level) => name(level as LocationLevel)).join(" / ");
  }, [location, locationOptions]);

  if (action === "load" && !session) {
    return <LoadingState label={t("registration.loading")} />;
  }

  if (session?.status === "blocked" && session.reason === "not_whitelisted") {
    return <StatusState title={t("registration.unavailable")} message={t("registration.noProfile")} onLogout={handleLogout} loading={action === "logout"} />;
  }

  if ((session?.status === "blocked" && session.reason === "awaiting_approval") || registration?.registration_status === "SUBMITTED") {
    return <StatusState title={t("registration.submittedTitle")} message={t("registration.awaitingApproval")} onLogout={handleLogout} loading={action === "logout"} success />;
  }

  if (!registration) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-600" size={30} />
        <h1 className="mt-3 text-lg font-semibold text-ink">{t("registration.unavailable")}</h1>
        <p className="mt-2 text-sm text-slate-600">{error ?? t("registration.loadError")}</p>
        <Button className="mt-5" onClick={() => void load()} variant="secondary"><RefreshCw className="mr-2" size={18} />{t("common.tryAgain")}</Button>
      </section>
    );
  }

  const editable = registration.can_edit;
  const isLocationEditable = (level: LocationLevel) => registration.scope.editable_levels.includes(level);

  return (
    <div className="space-y-5">
      <section className="rounded-lg bg-brand-700 p-5 text-white shadow-soft sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-medium text-brand-100">{t("registration.youthRegistration")}</p><h1 className="mt-1 text-2xl font-semibold">{t("registration.title")}</h1><p className="mt-2 text-sm leading-6 text-brand-50">{t("registration.help")}</p></div>
          <button aria-label={t("common.signOut")} className="rounded-md border border-white/25 p-2 text-white hover:bg-white/10" disabled={action !== null} onClick={handleLogout} type="button">{action === "logout" ? <Loader2 className="animate-spin" size={19} /> : <LogOut size={19} />}</button>
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-brand-50"><span>{t("registration.completion")}</span><span className="font-semibold">{registration.completion.percentage}%</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${registration.completion.percentage}%` }} /></div>
      </section>

      {registration.registration_status === "REJECTED" ? <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"><strong>{t("registration.rejectedTitle")}</strong><p className="mt-1">{registration.rejected_reason ?? t("registration.rejectedHelp")}</p></div> : null}
      {notice ? <div className="flex gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800"><Check className="shrink-0" size={18} />{notice}</div> : null}
      {error ? <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="shrink-0" size={18} />{error}</div> : null}

      <nav aria-label={t("registration.stepsAria")} className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <ol className="flex min-w-[560px] items-center justify-between gap-2">
          {steps.map(({ labelKey, icon: Icon }, index) => <li className="flex flex-1 items-center" key={labelKey}><button className={`flex w-full flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium ${index === step ? "bg-brand-50 text-brand-700" : index < step ? "text-brand-600" : "text-slate-500"}`} onClick={() => setStep(index)} type="button"><span className={`flex h-8 w-8 items-center justify-center rounded-full ${index <= step ? "bg-brand-600 text-white" : "bg-slate-100"}`}>{index < step ? <Check size={16} /> : <Icon size={16} />}</span>{t(labelKey)}</button>{index < steps.length - 1 ? <div className="h-px w-4 bg-slate-200" /> : null}</li>)}
        </ol>
      </nav>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5"><p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{t("common.stepOf", { step: step + 1, total: 5 })}</p><h2 className="mt-1 text-xl font-semibold text-ink">{t(steps[step].labelKey)}</h2></div>

        {step === 0 ? <PersonalForm value={personal} onChange={setPersonal} disabled={!editable || action !== null} /> : null}
        {step === 1 ? <ContactForm value={contact} onChange={setContact} disabled={!editable || action !== null} /> : null}
        {step === 2 ? <LocationForm value={location} options={locationOptions} editable={isLocationEditable} disabled={!editable || action !== null} onChange={setLocation} onLevelChange={updateLocationLevel} onDetect={detectLocation} assignedLevel={registration.scope.assigned_level} /> : null}
        {step === 3 ? <SocioForm value={socio} onChange={setSocio} disabled={!editable || action !== null} religions={registration.options.religions} disabilityTypes={registration.options.disability_types} categories={registration.options.sector_categories} sectors={registration.options.occupation_sectors} /> : null}
        {step === 4 ? <Review personal={personal} contact={contact} location={location} socio={socio} locationLabel={reviewLocation} registration={registration} /> : null}

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
          <Button disabled={step === 0 || action !== null} onClick={() => setStep((current) => Math.max(0, current - 1))} variant="secondary"><ChevronLeft className="mr-2" size={18} />{t("common.back")}</Button>
          <div className="flex flex-col gap-3 sm:flex-row">
            {step < 4 ? <><Button disabled={!editable || action !== null} onClick={() => void saveCurrentStep(false)} variant="secondary">{action && action !== "logout" ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Save className="mr-2" size={18} />}{t("common.save")}</Button><Button disabled={!editable || action !== null} onClick={() => void saveCurrentStep(true)}>{t("registration.saveContinue")}<ChevronRight className="ml-2" size={18} /></Button></> : <Button disabled={!editable || action !== null || registration.completion.percentage < 100} onClick={() => void submit()}>{action === "submit" ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Send className="mr-2" size={18} />}{t("registration.submitApplication")}</Button>}
          </div>
        </div>
      </section>
    </div>
  );
}

function PersonalForm({ value, onChange, disabled }: { value: PersonalStep; onChange: (value: PersonalStep) => void; disabled: boolean }) {
  const { t } = useTranslation();
  return <div className="grid gap-4 sm:grid-cols-2"><Field label={t("registration.firstName")}><input className={inputClass} disabled={disabled} onChange={(e) => onChange({ ...value, first_name: e.target.value })} required value={value.first_name} /></Field><Field label={t("registration.middleName")}><input className={inputClass} disabled={disabled} onChange={(e) => onChange({ ...value, middle_name: e.target.value })} value={value.middle_name} /></Field><Field label={t("registration.surname")}><input className={inputClass} disabled={disabled} onChange={(e) => onChange({ ...value, surname: e.target.value })} required value={value.surname} /></Field><Field label={t("registration.dateOfBirth")}><input className={inputClass} disabled={disabled} max={new Date().toISOString().slice(0, 10)} onChange={(e) => onChange({ ...value, birth_date: e.target.value })} required type="date" value={value.birth_date} /></Field><Field label={t("common.gender")}><select className={inputClass} disabled={disabled} onChange={(e) => onChange({ ...value, gender: e.target.value })} required value={value.gender}><option value="">{t("profile.selectGender")}</option><option value="Male">{t("common.male")}</option><option value="Female">{t("common.female")}</option></select></Field></div>;
}

function ContactForm({ value, onChange, disabled }: { value: ContactStep; onChange: (value: ContactStep) => void; disabled: boolean }) {
  const { t } = useTranslation();
  return <div className="grid gap-4 sm:grid-cols-2"><Field label={t("profile.primaryPhone")}><input className={inputClass} disabled value={value.primary_phone} /></Field><Field label={t("registration.emailAddress")}><input className={inputClass} disabled={disabled} onChange={(e) => onChange({ ...value, email: e.target.value })} type="email" value={value.email} /></Field><Field label={t("profile.emergencyContact")}><input className={inputClass} disabled={disabled} onChange={(e) => onChange({ ...value, emergency_contact: e.target.value })} required type="tel" value={value.emergency_contact} /></Field></div>;
}

function LocationForm({ value, options, editable, disabled, onChange, onLevelChange, onDetect, assignedLevel }: { value: LocationStep; options: LocationOptions; editable: (level: LocationLevel) => boolean; disabled: boolean; onChange: (value: LocationStep) => void; onLevelChange: (level: LocationLevel, value: number | null) => Promise<void>; onDetect: () => void; assignedLevel: LocationLevel | null }) {
  const { t } = useTranslation();
  const levels: LocationLevel[] = ["country", "region", "district", "division", "ward", "street"];
  const scope = assignedLevel ? t(locationTranslationKeys[assignedLevel]) : t("common.location");
  return <div className="space-y-4"><div className="rounded-md border border-brand-100 bg-brand-50 p-3 text-sm text-brand-700">{t("registration.locationScope", { scope })}</div><div className="grid gap-4 sm:grid-cols-2">{levels.map((level) => <Field key={level} label={t(locationTranslationKeys[level])}><select className={inputClass} disabled={disabled || !editable(level)} onChange={(e) => void onLevelChange(level, numberOrNull(e.target.value))} required value={value[`${level}_id`] ?? ""}><option value="">{t("profile.selectLocation", { level: t(locationTranslationKeys[level]).toLowerCase() })}</option>{options[level].map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></Field>)}</div><Field label={t("registration.houseAddress")}><textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100" disabled={disabled} onChange={(e) => onChange({ ...value, physical_address: e.target.value })} required value={value.physical_address} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label={t("profile.latitude")}><input className={inputClass} disabled={disabled} inputMode="decimal" onChange={(e) => onChange({ ...value, latitude: e.target.value })} step="any" type="number" value={value.latitude ?? ""} /></Field><Field label={t("profile.longitude")}><input className={inputClass} disabled={disabled} inputMode="decimal" onChange={(e) => onChange({ ...value, longitude: e.target.value })} step="any" type="number" value={value.longitude ?? ""} /></Field></div><Button disabled={disabled} onClick={onDetect} variant="secondary"><LocateFixed className="mr-2" size={18} />{t("registration.detectLocation")}</Button></div>;
}

function SocioForm({ value, onChange, disabled, religions, disabilityTypes, categories, sectors }: { value: SocioEconomicStep; onChange: (value: SocioEconomicStep) => void; disabled: boolean; religions: SelectOption[]; disabilityTypes: SelectOption[]; categories: SelectOption[]; sectors: Array<SelectOption & { category_id: number | null }> }) {
  const { t } = useTranslation();
  const employed = value.occupation_type !== "" && value.occupation_type !== "Unemployed";
  const selectedSector = sectors.find((sector) => sector.id === value.occupation_sector_id);
  const [categoryId, setCategoryId] = useState<number | null>(selectedSector?.category_id ?? null);
  const wish = value.wishes[0] ?? emptyWish;
  const selectedWishSector = sectors.find((sector) => sector.id === wish.wish_sector_id);
  const [wishCategoryId, setWishCategoryId] = useState<number | null>(wish.sector_category_id ?? selectedWishSector?.category_id ?? null);
  const filteredSectors = sectors.filter((sector) => sector.category_id === categoryId);
  const filteredWishSectors = sectors.filter((sector) => sector.category_id === wishCategoryId);
  return <div className="grid gap-4 sm:grid-cols-2"><Field label={t("profile.religion")}><select className={inputClass} disabled={disabled} onChange={(e) => onChange({ ...value, religion_id: numberOrNull(e.target.value) })} required value={value.religion_id ?? ""}><option value="">{t("profile.selectReligion")}</option>{religions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></Field><Field label={t("profile.maritalStatus")}><select className={inputClass} disabled={disabled} onChange={(e) => onChange({ ...value, marital_status: e.target.value })} required value={value.marital_status}><option value="">{t("profile.selectStatus")}</option><option value="Single">{t("common.single")}</option><option value="Married">{t("common.married")}</option><option value="Divorced">{t("common.divorced")}</option><option value="Widow/Widower">{t("common.widowed")}</option></select></Field><Field label={t("registration.occupation")}><select className={inputClass} disabled={disabled} onChange={(e) => { if (e.target.value === "Unemployed") setCategoryId(null); onChange({ ...value, occupation_type: e.target.value, occupation_sector_id: e.target.value === "Unemployed" ? null : value.occupation_sector_id }); }} required value={value.occupation_type}><option value="">{t("profile.selectOccupation")}</option><option value="Unemployed">{t("registration.unemployed")}</option><option value="Employed">{t("registration.employed")}</option><option value="Self Employed">{t("registration.selfEmployed")}</option><option value="Business Owner">{t("registration.businessOwner")}</option></select></Field>{employed ? <><Field label={t("profile.sectorCategory")}><select className={inputClass} disabled={disabled} onChange={(e) => { setCategoryId(numberOrNull(e.target.value)); onChange({ ...value, occupation_sector_id: null }); }} required value={categoryId ?? ""}><option value="">{t("profile.selectCategory")}</option>{categories.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></Field><Field label={t("profile.occupationSector")}><select className={inputClass} disabled={disabled || !categoryId} onChange={(e) => onChange({ ...value, occupation_sector_id: numberOrNull(e.target.value) })} required value={value.occupation_sector_id ?? ""}><option value="">{t("profile.selectSector")}</option>{filteredSectors.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></Field></> : null}<Field label={t("registration.disabilityStatus")}><select className={inputClass} disabled={disabled} onChange={(e) => onChange({ ...value, has_disability: e.target.value, disability_type_id: e.target.value === "Yes" ? value.disability_type_id : null })} required value={value.has_disability}><option value="">{t("profile.selectStatus")}</option><option value="No">{t("common.no")}</option><option value="Yes">{t("common.yes")}</option></select></Field>{value.has_disability === "Yes" ? <Field label={t("profile.disabilityType")}><select className={inputClass} disabled={disabled} onChange={(e) => onChange({ ...value, disability_type_id: numberOrNull(e.target.value) })} required value={value.disability_type_id ?? ""}><option value="">{t("profile.selectDisability")}</option>{disabilityTypes.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></Field> : null}<Field label={t("profile.hasWishes")}><select className={inputClass} disabled={disabled} onChange={(e) => onChange({ ...value, youth_wishes: e.target.value, wishes: e.target.value === "Yes" ? (value.wishes.length ? value.wishes : [{ ...emptyWish }]) : [] })} required value={value.youth_wishes}><option value="No">{t("common.no")}</option><option value="Yes">{t("common.yes")}</option></select></Field>{value.youth_wishes === "Yes" ? <><Field label={t("profile.interestType")}><select className={inputClass} disabled={disabled} onChange={(e) => onChange({ ...value, wishes: [{ ...wish, interest_type: e.target.value }] })} required value={wish.interest_type}><option value="">{t("profile.selectInterest")}</option><option value="Employed">{t("registration.employed")}</option><option value="Self Employed">{t("registration.selfEmployed")}</option><option value="Business Owner">{t("registration.businessOwner")}</option><option value="Any">{t("registration.any")}</option></select></Field><Field label={t("profile.wishSectorCategory")}><select className={inputClass} disabled={disabled} onChange={(e) => { const nextCategory = numberOrNull(e.target.value); setWishCategoryId(nextCategory); onChange({ ...value, wishes: [{ ...wish, sector_category_id: nextCategory, wish_sector_id: null }] }); }} required value={wishCategoryId ?? ""}><option value="">{t("profile.selectCategory")}</option>{categories.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></Field><Field label={t("profile.wishSector")}><select className={inputClass} disabled={disabled || !wishCategoryId} onChange={(e) => onChange({ ...value, wishes: [{ ...wish, sector_category_id: wishCategoryId, wish_sector_id: numberOrNull(e.target.value) }] })} required value={wish.wish_sector_id ?? ""}><option value="">{t("profile.selectSector")}</option>{filteredWishSectors.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></Field><Field label={t("profile.wishDescription")}><textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100" disabled={disabled} onChange={(e) => onChange({ ...value, wishes: [{ ...wish, description: e.target.value }] })} placeholder={t("profile.wishPlaceholder")} value={wish.description} /></Field></> : null}</div>;
}

function Review({ personal, contact, location, socio, locationLabel, registration }: { personal: PersonalStep; contact: ContactStep; location: LocationStep; socio: SocioEconomicStep; locationLabel: string; registration: RegistrationData }) {
  const { t } = useTranslation();
  const religion = registration.options.religions.find((item) => item.id === socio.religion_id)?.name ?? "-";
  const sector = registration.options.occupation_sectors.find((item) => item.id === socio.occupation_sector_id)?.name;
  const disabilityType = registration.options.disability_types.find((item) => item.id === socio.disability_type_id)?.name;
  const wish = socio.wishes[0];
  const wishSector = wish ? registration.options.occupation_sectors.find((item) => item.id === wish.wish_sector_id)?.name : null;
  const translateValue = (value: string) => {
    switch (value) {
      case "Yes": return t("common.yes");
      case "No": return t("common.no");
      case "Male": return t("common.male");
      case "Female": return t("common.female");
      case "Single": return t("common.single");
      case "Married": return t("common.married");
      case "Divorced": return t("common.divorced");
      case "Widow/Widower": return t("common.widowed");
      case "Unemployed": return t("registration.unemployed");
      case "Employed": return t("registration.employed");
      case "Self Employed": return t("registration.selfEmployed");
      case "Business Owner": return t("registration.businessOwner");
      case "Any": return t("registration.any");
      default: return value;
    }
  };
  const occupationValue = sector ? `${translateValue(socio.occupation_type)} / ${sector}` : translateValue(socio.occupation_type);
  const disabilityValue = socio.has_disability === "Yes" && disabilityType ? `${t("common.yes")} / ${disabilityType}` : translateValue(socio.has_disability);
  const wishesValue = socio.youth_wishes === "Yes" && wish ? `${translateValue(wish.interest_type)} / ${wishSector ?? "-"}${wish.description ? ` / ${wish.description}` : ""}` : translateValue(socio.youth_wishes);
  const rows = [[t("registration.fullName"), [personal.first_name, personal.middle_name, personal.surname].filter(Boolean).join(" ")], [t("common.birthDate"), personal.birth_date], [t("common.gender"), translateValue(personal.gender)], [t("profile.primaryPhone"), contact.primary_phone], [t("common.email"), contact.email || "-"], [t("profile.emergencyContact"), contact.emergency_contact], [t("common.location"), locationLabel], [t("profile.physicalAddress"), location.physical_address], [t("profile.religion"), religion], [t("profile.maritalStatus"), translateValue(socio.marital_status)], [t("profile.occupation"), occupationValue], [t("profile.disability"), disabilityValue], [t("profile.wishes"), wishesValue]];
  const sectionKeyMap: Record<string, TranslationKey> = { personal: "registration.personal", contact: "registration.contact", location: "registration.location", socio_economic: "registration.socioEconomic", socio: "registration.socioEconomic" };
  const missingSections = registration.completion.sections.filter((item) => !item.completed).map((item) => sectionKeyMap[item.key] ? t(sectionKeyMap[item.key]) : item.label).join(", ");
  return <div className="space-y-4"><div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{t("registration.reviewHelp")}</div><dl className="divide-y divide-slate-100 rounded-md border border-slate-200">{rows.map(([label, value]) => <div className="grid gap-1 px-4 py-3 sm:grid-cols-[160px_1fr]" key={label}><dt className="text-sm font-medium text-slate-500">{label}</dt><dd className="text-sm text-ink">{value || "-"}</dd></div>)}</dl>{registration.completion.missing_sections.length ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{t("registration.complete", { sections: missingSections })}</div> : <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">{t("registration.allComplete")}</div>}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className={labelClass}>{label}</span>{children}</label>; }
function LoadingState({ label }: { label: string }) { return <div className="flex items-center justify-center py-16 text-sm text-slate-600"><Loader2 className="mr-2 animate-spin text-brand-700" size={20} />{label}</div>; }
function StatusState({ title, message, onLogout, loading, success = false }: { title: string; message: string; onLogout: () => void; loading: boolean; success?: boolean }) { const { t } = useTranslation(); return <section className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft"><div className={`mx-auto inline-flex h-12 w-12 items-center justify-center rounded-md ${success ? "bg-green-50 text-green-700" : "bg-brand-50 text-brand-700"}`}><ClipboardCheck size={24} /></div><h1 className="mt-4 text-xl font-semibold text-ink">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-600">{message}</p><Button className="mt-6 w-full" disabled={loading} onClick={onLogout} variant="secondary">{loading ? <Loader2 className="mr-2 animate-spin" size={18} /> : <LogOut className="mr-2" size={18} />}{t("common.signOut")}</Button></section>; }
