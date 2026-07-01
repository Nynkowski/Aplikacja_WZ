import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { createWzRegular, getAdresses } from "../../services/wz";
import type { AdressOption, WzRegularEditFormValues } from "../../types/wz";

type DashboardOutletContext = {
  userId: number;
  username: string;
  role: string;
};

function extractApiErrorMessage(errorData: unknown): string | null {
  if (typeof errorData === "string" && errorData.trim()) {
    return errorData;
  }

  if (!errorData || typeof errorData !== "object") {
    return null;
  }

  if (!("detail" in errorData)) {
    return null;
  }

  const detail = (errorData as { detail?: unknown }).detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const firstItem = detail[0];

    if (typeof firstItem === "string" && firstItem.trim()) {
      return firstItem;
    }

    if (firstItem && typeof firstItem === "object" && "msg" in firstItem) {
      const msg = (firstItem as { msg?: unknown }).msg;
      if (typeof msg === "string" && msg.trim()) {
        return msg;
      }
    }
  }

  return null;
}

function WzRegularCreatePage() {
  const navigate = useNavigate();
  const { userId, username } = useOutletContext<DashboardOutletContext>();

  const [adresses, setAdresses] = useState<AdressOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adressError, setAdressError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [contentDescription, setContentDescription] = useState("");
  const [formValues, setFormValues] = useState<WzRegularEditFormValues>({
    username,
    senderId: "",
    recipientId: "",
    sealNumber: "",
    carPlates: "",
  });

  useEffect(() => {
    setFormValues((prev) => ({ ...prev, username }));
  }, [username]);

  useEffect(() => {
    let cancelled = false;

    const loadAdresses = async () => {
      setIsLoading(true);
      setAdressError(null);

      try {
        const adressOptions = await getAdresses();

        if (!cancelled) {
          setAdresses(adressOptions);
        }
      } catch {
        if (!cancelled) {
          setAdressError("Nie udalo sie pobrac listy adresow.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAdresses();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFieldChange = (
    field: keyof WzRegularEditFormValues,
    value: string,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveMessage(null);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const sealNumber = formValues.sealNumber.trim();
    const carPlates = formValues.carPlates.trim();

    if (!formValues.senderId.trim()) {
      setSaveMessage("Miejsce zaladunku jest wymagane.");
      return;
    }

    if (!formValues.recipientId.trim()) {
      setSaveMessage("Miejsce rozladunku jest wymagane.");
      return;
    }

    if (!sealNumber) {
      setSaveMessage("Numer plomby jest wymagany.");
      return;
    }

    if (!carPlates) {
      setSaveMessage("Numer auta jest wymagany.");
      return;
    }

    if (!Number.isFinite(userId)) {
      setSaveMessage("Brak ID zalogowanego uzytkownika.");
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const created = await createWzRegular({
        userId,
        senderId: formValues.senderId,
        recipientId: formValues.recipientId,
        sealNumber,
        carPlates,
      });

      navigate(`/dashboard/wz-regular/${created.id}/edit`);
    } catch (err) {
      if (isAxiosError(err)) {
        const message = extractApiErrorMessage(err.response?.data);
        setSaveMessage(message ?? "Nie udalo sie utworzyc WZ.");
      } else {
        setSaveMessage("Nie udalo sie utworzyc WZ.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const selectedSenderAdress = useMemo(
    () =>
      adresses.find((adress) => adress.name === formValues.senderId) ?? null,
    [adresses, formValues.senderId],
  );

  const selectedRecipientAdress = useMemo(
    () =>
      adresses.find((adress) => adress.name === formValues.recipientId) ?? null,
    [adresses, formValues.recipientId],
  );

  return (
    <section className="dashboard__card">
      <div className="dashboard__card-header">
        <h2>Nowa WZ</h2>
        <button
          type="button"
          className="dashboard__pagination-btn"
          onClick={() => navigate("/dashboard/wz-regular")}
        >
          Powrot do listy
        </button>
      </div>

      {isLoading ? (
        <div className="dashboard__empty">
          <p>Ladowanie formularza...</p>
        </div>
      ) : null}

      {!isLoading ? (
        <div className="dashboard__edit-layout">
          <form className="dashboard__edit-form" onSubmit={handleSave}>
            <label className="dashboard__edit-field">
              <span>Wystawil</span>
              <input value={formValues.username} readOnly />
            </label>

            <div className="dashboard__address-grid">
              <label className="dashboard__edit-field">
                <span>Zaladunek</span>
                <select
                  value={formValues.senderId}
                  onChange={(event) =>
                    handleFieldChange("senderId", event.target.value)
                  }
                >
                  <option value="">Wybierz miejsce zaladunku</option>
                  {adresses.map((adress) => (
                    <option key={`sender-${adress.id}`} value={adress.name}>
                      {adress.name}
                    </option>
                  ))}
                </select>
                <small className="dashboard__adress-preview">
                  {selectedSenderAdress?.fullAdress || "Brak wybranego adresu"}
                </small>
              </label>

              <label className="dashboard__edit-field">
                <span>Rozladunek</span>
                <select
                  value={formValues.recipientId}
                  onChange={(event) =>
                    handleFieldChange("recipientId", event.target.value)
                  }
                >
                  <option value="">Wybierz miejsce rozladunku</option>
                  {adresses.map((adress) => (
                    <option key={`recipient-${adress.id}`} value={adress.name}>
                      {adress.name}
                    </option>
                  ))}
                </select>
                <small className="dashboard__adress-preview">
                  {selectedRecipientAdress?.fullAdress ||
                    "Brak wybranego adresu"}
                </small>
              </label>
            </div>

            {adressError ? (
              <p className="dashboard__edit-message">{adressError}</p>
            ) : null}

            <div className="dashboard__vehicle-grid">
              <label className="dashboard__edit-field">
                <span>Numer plomby</span>
                <input
                  value={formValues.sealNumber}
                  required
                  onChange={(event) =>
                    handleFieldChange("sealNumber", event.target.value)
                  }
                />
              </label>

              <label className="dashboard__edit-field">
                <span>Numer auta</span>
                <input
                  value={formValues.carPlates}
                  required
                  onChange={(event) =>
                    handleFieldChange("carPlates", event.target.value)
                  }
                />
              </label>
            </div>

            <div className="dashboard__edit-actions">
              <button
                type="submit"
                className="dashboard__action-btn"
                disabled={isSaving}
              >
                {isSaving ? "Tworzenie..." : "Utworz WZ"}
              </button>
              <Link to="/dashboard/wz-regular" className="dashboard__nav-link">
                Anuluj
              </Link>
            </div>

            {saveMessage ? (
              <p className="dashboard__edit-message">{saveMessage}</p>
            ) : null}
          </form>

          <section>
            <h3 className="dashboard__edit-section-title">
              Pozycje zawartosci
            </h3>
            <div className="dashboard__content-controls">
              <input
                className="dashboard__content-input"
                value={contentDescription}
                onChange={(event) => setContentDescription(event.target.value)}
                placeholder="Wpisz zawartosc"
                disabled
              />
              <button
                type="button"
                className="dashboard__content-add-btn"
                disabled
                aria-label="Dodaj pozycje zawartosci"
              >
                +
              </button>
            </div>

            <div className="dashboard__empty">
              <p>Po utworzeniu WZ bedziesz mogl dodawac pozycje zawartosci.</p>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

export default WzRegularCreatePage;
