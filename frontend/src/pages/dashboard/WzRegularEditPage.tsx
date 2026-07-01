import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import {
  createWzRegularContent,
  deleteWzRegularContent,
  getAdresses,
  getWzRegularEditById,
  updateWzRegular,
} from "../../services/wz";
import type {
  AdressOption,
  WzRegularEditData,
  WzRegularEditFormValues,
} from "../../types/wz";

function formatCreatedDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function toInitialFormValues(data: WzRegularEditData): WzRegularEditFormValues {
  return {
    username: data.username,
    senderId: data.senderId,
    recipientId: data.recipientId,
    sealNumber: data.sealNumber,
    carPlates: data.carPlates,
  };
}

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

function WzRegularEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, role } = useOutletContext<{ userId: number; role: string }>();

  const recordId = useMemo(() => {
    if (!id) {
      return null;
    }

    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [id]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adressError, setAdressError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [record, setRecord] = useState<WzRegularEditData | null>(null);
  const [adresses, setAdresses] = useState<AdressOption[]>([]);
  const [contentList, setContentList] = useState<
    WzRegularEditData["contentList"]
  >([]);
  const [contentDescription, setContentDescription] = useState("");
  const [contentError, setContentError] = useState<string | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [deletingContentId, setDeletingContentId] = useState<number | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState<WzRegularEditFormValues>({
    username: "",
    senderId: "",
    recipientId: "",
    sealNumber: "",
    carPlates: "",
  });

  useEffect(() => {
    let cancelled = false;

    const loadRecord = async () => {
      if (!recordId) {
        setError("Nieprawidlowe ID wpisu.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [response, adressOptions] = await Promise.all([
          getWzRegularEditById(recordId),
          getAdresses(),
        ]);

        if (!cancelled) {
          setRecord(response);
          setContentList(response.contentList);
          setFormValues(toInitialFormValues(response));
          setAdresses(adressOptions);
          setAdressError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Nie udalo sie pobrac danych wpisu do edycji.");
          setAdressError("Nie udalo sie pobrac listy adresow.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadRecord();

    return () => {
      cancelled = true;
    };
  }, [recordId]);

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

    if (!sealNumber) {
      setSaveMessage("Numer plomby jest wymagany.");
      return;
    }

    if (!carPlates) {
      setSaveMessage("Numer auta jest wymagany.");
      return;
    }

    if (!recordId) {
      setSaveMessage("Nieprawidlowe ID wpisu.");
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const updatedRecord = await updateWzRegular(recordId, {
        senderId: formValues.senderId,
        recipientId: formValues.recipientId,
        sealNumber,
        carPlates,
      });

      setRecord(updatedRecord);
      setFormValues(toInitialFormValues(updatedRecord));
      setContentList(updatedRecord.contentList);
      setSaveMessage("Zmiany zostaly zapisane.");
    } catch (err) {
      if (isAxiosError(err)) {
        const message = extractApiErrorMessage(err.response?.data);
        setSaveMessage(message ?? "Nie udalo sie zapisac zmian.");
      } else {
        setSaveMessage("Nie udalo sie zapisac zmian.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddContent = async () => {
    const trimmedValue = contentDescription.trim();

    if (!trimmedValue) {
      setContentError("Wpisz zawartosc przed dodaniem pozycji.");
      return;
    }

    if (!recordId) {
      setContentError("Nieprawidlowe ID wpisu.");
      return;
    }

    if (!Number.isFinite(userId)) {
      setContentError(
        "Brak ID zalogowanego uzytkownika. Wyloguj sie i zaloguj ponownie.",
      );
      return;
    }

    setIsAddingContent(true);
    setContentError(null);

    try {
      const createdItem = await createWzRegularContent(recordId, {
        contentDescription: trimmedValue,
        addingUserId: userId,
      });

      setContentList((prev) => [...prev, createdItem]);
      setContentDescription("");
      setSaveMessage(null);
    } catch (err) {
      if (isAxiosError(err)) {
        const message = extractApiErrorMessage(err.response?.data);
        setContentError(message ?? "Nie udalo sie dodac pozycji zawartosci.");
      } else {
        setContentError("Nie udalo sie dodac pozycji zawartosci.");
      }
    } finally {
      setIsAddingContent(false);
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

  const isAdmin = String(role).toLowerCase() === "admin";

  const handleDeleteContent = async (contentId: number) => {
    if (!recordId) {
      setContentError("Nieprawidlowe ID wpisu.");
      return;
    }

    setDeletingContentId(contentId);
    setContentError(null);

    try {
      await deleteWzRegularContent(recordId, contentId);
      setContentList((prev) =>
        prev.filter((content) => content.id !== contentId),
      );
    } catch (err) {
      if (isAxiosError(err)) {
        const message = extractApiErrorMessage(err.response?.data);
        setContentError(message ?? "Nie udalo sie usunac pozycji zawartosci.");
      } else {
        setContentError("Nie udalo sie usunac pozycji zawartosci.");
      }
    } finally {
      setDeletingContentId(null);
    }
  };

  return (
    <section className="dashboard__card">
      <div className="dashboard__card-header">
        <h2>Edycja WZ Regular</h2>
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
          <p>Ladowanie danych wpisu...</p>
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="dashboard__empty">
          <p>{error}</p>
        </div>
      ) : null}

      {!isLoading && !error && record ? (
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

            <div className="dashboard__edit-meta">
              <span>ID: {record.id}</span>
              <span>Utworzono: {formatCreatedDate(record.createdDate)}</span>
            </div>

            <div className="dashboard__edit-actions">
              <button
                type="submit"
                className="dashboard__action-btn"
                disabled={isSaving}
              >
                {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
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
                onChange={(event) => {
                  setContentDescription(event.target.value);
                  setContentError(null);
                }}
                placeholder="Wpisz zawartosc"
              />
              <button
                type="button"
                className="dashboard__content-add-btn"
                onClick={handleAddContent}
                aria-label="Dodaj pozycje zawartosci"
                disabled={isAddingContent}
              >
                {isAddingContent ? "..." : "+"}
              </button>
            </div>

            {contentError ? (
              <p className="dashboard__edit-message">{contentError}</p>
            ) : null}

            {contentList.length === 0 ? (
              <div className="dashboard__empty">
                <p>Brak pozycji przypisanych do tego WZ.</p>
              </div>
            ) : (
              <div className="dashboard__table-wrapper">
                <table className="dashboard__table">
                  <thead>
                    <tr>
                      <th>Opis</th>
                      <th>Dodal</th>
                      <th>Data dodania</th>
                      {isAdmin ? <th>Akcje</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {contentList.map((content) => (
                      <tr key={content.id}>
                        <td>{content.contentDescription || "-"}</td>
                        <td>{content.addingUser || "-"}</td>
                        <td>{formatCreatedDate(content.addedDate)}</td>
                        {isAdmin ? (
                          <td>
                            <button
                              type="button"
                              className="dashboard__content-delete-btn"
                              onClick={() => handleDeleteContent(content.id)}
                              aria-label={`Usun pozycje ${content.id}`}
                              disabled={deletingContentId === content.id}
                            >
                              x
                            </button>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}

export default WzRegularEditPage;
