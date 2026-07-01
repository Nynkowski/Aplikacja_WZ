import { Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOpenWzRegular } from "../../services/wz";
import type { WzRegularFilters, WzRegularItem } from "../../types/wz";

const ITEMS_PER_PAGE = 100;

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

function WzRegularPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WzRegularItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState<number | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isServerPaginated, setIsServerPaginated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WzRegularFilters>({
    userId: "",
    senderId: "",
    recipientId: "",
    sealNumber: "",
    carPlates: "",
    createdDate: "",
  });
  const [debouncedFilters, setDebouncedFilters] =
    useState<WzRegularFilters>(filters);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [filters]);

  useEffect(() => {
    let cancelled = false;

    const loadWzRegular = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getOpenWzRegular({
          ...debouncedFilters,
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
        });

        if (!cancelled) {
          setItems(result.items);
          setTotalItems(result.total);
          setServerTotalPages(result.totalPages ?? null);
          setHasNextPage(result.hasNextPage);
          setIsServerPaginated(result.isServerPaginated);
        }
      } catch {
        if (!cancelled) {
          setError("Nie udalo sie pobrac listy WZ Regular.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadWzRegular();

    return () => {
      cancelled = true;
    };
  }, [debouncedFilters, currentPage]);

  const effectiveTotal = isServerPaginated ? totalItems : items.length;
  const totalPages = Math.max(
    1,
    serverTotalPages ?? Math.ceil(effectiveTotal / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const canGoNext = isServerPaginated ? hasNextPage : safePage < totalPages;

  const pagedItems = useMemo(() => {
    if (isServerPaginated) {
      return items;
    }

    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return items.slice(startIndex, endIndex);
  }, [items, isServerPaginated, safePage]);

  const startItemNumber =
    effectiveTotal === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const endItemNumber = Math.min(safePage * ITEMS_PER_PAGE, effectiveTotal);

  const handleFilterChange = (field: keyof WzRegularFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  return (
    <section className="dashboard__card">
      <div className="dashboard__card-header">
        <h2>WZ Regular</h2>
        <button
          type="button"
          className="dashboard__action-btn"
          onClick={() => navigate("/dashboard/wz-regular/new")}
        >
          + Nowy WZ
        </button>
      </div>

      {isLoading ? (
        <div className="dashboard__empty">
          <p>Ladowanie WZ Regular...</p>
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="dashboard__empty">
          <p>{error}</p>
        </div>
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <div className="dashboard__empty">
          <p>Brak wynikow.</p>
        </div>
      ) : null}

      {!isLoading && !error && items.length > 0 ? (
        <>
          <div className="dashboard__pagination-summary">
            Pokazano {startItemNumber}-{endItemNumber} z {effectiveTotal}{" "}
            wynikow
          </div>

          <div className="dashboard__table-wrapper">
            <table className="dashboard__table">
              <thead>
                <tr>
                  <th>Wystawił</th>
                  <th>Załadunek</th>
                  <th>Rozładunek</th>
                  <th>Numer plomby</th>
                  <th>Numer auta</th>
                  <th>Data utworzenia</th>
                  <th>Akcje</th>
                </tr>
                <tr className="dashboard__table-filter-row">
                  <th className="dashboard__table-filter-cell">
                    <input
                      className="dashboard__table-filter-input"
                      placeholder="Wystawil (ID)"
                      value={filters.userId}
                      onChange={(event) =>
                        handleFilterChange("userId", event.target.value)
                      }
                    />
                  </th>
                  <th className="dashboard__table-filter-cell">
                    <input
                      className="dashboard__table-filter-input"
                      placeholder="Szukaj zaladunku"
                      value={filters.senderId}
                      onChange={(event) =>
                        handleFilterChange("senderId", event.target.value)
                      }
                    />
                  </th>
                  <th className="dashboard__table-filter-cell">
                    <input
                      className="dashboard__table-filter-input"
                      placeholder="Szukaj rozladunku"
                      value={filters.recipientId}
                      onChange={(event) =>
                        handleFilterChange("recipientId", event.target.value)
                      }
                    />
                  </th>
                  <th className="dashboard__table-filter-cell">
                    <input
                      className="dashboard__table-filter-input"
                      placeholder="Numer plomby"
                      value={filters.sealNumber}
                      onChange={(event) =>
                        handleFilterChange("sealNumber", event.target.value)
                      }
                    />
                  </th>
                  <th className="dashboard__table-filter-cell">
                    <input
                      className="dashboard__table-filter-input"
                      placeholder="Numer auta"
                      value={filters.carPlates}
                      onChange={(event) =>
                        handleFilterChange("carPlates", event.target.value)
                      }
                    />
                  </th>
                  <th className="dashboard__table-filter-cell">
                    <input
                      className="dashboard__table-filter-input"
                      placeholder="Data utworzenia"
                      value={filters.createdDate}
                      onChange={(event) =>
                        handleFilterChange("createdDate", event.target.value)
                      }
                    />
                  </th>
                  <th className="dashboard__table-filter-cell" />
                </tr>
              </thead>
              <tbody>
                {pagedItems.map((item) => (
                  <tr key={String(item.id)}>
                    <td>{item.userId ?? "-"}</td>
                    <td>{item.senderId ?? "-"}</td>
                    <td>{item.recipientId ?? "-"}</td>
                    <td>{item.sealNumber ?? "-"}</td>
                    <td>{item.carPlates ?? "-"}</td>
                    <td>{formatCreatedDate(item.createdDate)}</td>
                    <td>
                      <button
                        type="button"
                        className="dashboard__edit-btn"
                        title="Edytuj wpis"
                        aria-label={`Edytuj wpis ${String(item.id)}`}
                        onClick={() => {
                          navigate(
                            `/dashboard/wz-regular/${String(item.id)}/edit`,
                          );
                        }}
                      >
                        <Pencil size={16} strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dashboard__pagination">
            <button
              type="button"
              className="dashboard__pagination-btn"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage === 1}
            >
              Poprzednia
            </button>

            <span className="dashboard__pagination-page">
              Strona {safePage} z {totalPages}
            </span>

            <button
              type="button"
              className="dashboard__pagination-btn"
              onClick={() =>
                setCurrentPage((page) => (canGoNext ? page + 1 : page))
              }
              disabled={!canGoNext}
            >
              Nastepna
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default WzRegularPage;
