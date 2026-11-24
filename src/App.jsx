
import {
  Cake,
  Heart,
  CalendarDays,
  Users,
  Gift,
  Search,
  Plus,
  ChevronRight,
  Settings,
  LayoutDashboard,
  Calendar,
  LoaderCircle,
  X,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { mockBirthdays } from "./data/mockBirthdays";
import AuthScreen from "./components/AuthScreen";

function getNextBirthday(birthday) {
  const today = new Date();

  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  let nextDate = new Date(
    today.getFullYear(),
    birthday.month - 1,
    birthday.day
  );

  if (nextDate < todayDate) {
    nextDate = new Date(
      today.getFullYear() + 1,
      birthday.month - 1,
      birthday.day
    );
  }

  return nextDate;
}

function getDaysUntilBirthday(birthday) {
  const today = new Date();

  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const nextDate = getNextBirthday(birthday);

  return Math.round(
    (nextDate.getTime() - todayDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

function getTurningAge(birthday) {
  return getNextBirthday(birthday).getFullYear() -
    birthday.year;
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getBirthdayStorageKey(userId) {
  return `birthday-reminder:${userId}:birthdays`;
}

function isBirthdayEntry(birthday) {
  return (
    birthday &&
    typeof birthday.name === "string" &&
    birthday.name.trim().length > 0 &&
    typeof birthday.category === "string" &&
    birthday.category.trim().length > 0 &&
    Number.isInteger(birthday.day) &&
    Number.isInteger(birthday.month) &&
    Number.isInteger(birthday.year) &&
    birthday.month >= 1 &&
    birthday.month <= 12 &&
    birthday.day >= 1 &&
    birthday.day <= new Date(birthday.year, birthday.month, 0).getDate()
  );
}

function getTodayInputValue() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

function loadBirthdayData(userId) {
  try {
    const saved = localStorage.getItem(getBirthdayStorageKey(userId));
    if (saved === null) {
      return { birthdays: mockBirthdays, loaded: true, error: "" };
    }

    const savedBirthdays = JSON.parse(saved);
    if (
      !Array.isArray(savedBirthdays) ||
      !savedBirthdays.every(isBirthdayEntry)
    ) {
      throw new Error("Saved birthday data is invalid.");
    }

    return {
      birthdays: [
        ...mockBirthdays,
        ...savedBirthdays.map((birthday) => ({
          ...birthday,
          isCustom: true,
        })),
      ],
      loaded: true,
      error: "",
    };
  } catch (error) {
    return {
      birthdays: mockBirthdays,
      loaded: true,
      error: `Could not load saved birthdays: ${error.message}`,
    };
  }
}

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div>
          <p className="stat-label">{title}</p>
          <h2 className="stat-value">
            {value}
          </h2>
        </div>

        <div className="stat-icon">
          <Icon size={20} />
        </div>
      </div>

      <p className="stat-description">
        {description}
      </p>
    </div>
  );
}

function AddBirthdayDialog({ error, onClose, onSubmit }) {
  const today = getTodayInputValue();
  const [validationError, setValidationError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name").trim();
    const category = formData.get("category").trim();
    if (!name || !category) {
      setValidationError("Enter a name and category without only spaces.");
      return;
    }

    const [year, month, day] = formData
      .get("birthday")
      .split("-")
      .map(Number);

    onSubmit({
      name,
      category,
      day,
      month,
      year,
    });
    setValidationError("");
  }

  return (
    <div className="dialog-backdrop">
      <section
        aria-labelledby="add-birthday-title"
        aria-modal="true"
        className="birthday-dialog"
        role="dialog"
      >
        <div className="dialog-heading">
          <div>
            <h2 id="add-birthday-title">Add a birthday</h2>
            <p>Save a birthday to your reminder list.</p>
          </div>
          <button
            aria-label="Close"
            className="dialog-close-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form className="birthday-form" onSubmit={handleSubmit}>
          {(error || validationError) && (
            <p className="birthday-storage-error" role="alert">
              {error || validationError}
            </p>
          )}
          <label htmlFor="birthday-name">Name</label>
          <input
            autoFocus
            id="birthday-name"
            maxLength={80}
            name="name"
            required
          />

          <label htmlFor="birthday-date">Date of birth</label>
          <input
            id="birthday-date"
            max={today}
            name="birthday"
            required
            type="date"
          />

          <label htmlFor="birthday-category">Category</label>
          <input
            id="birthday-category"
            maxLength={40}
            name="category"
            required
          />

          <div className="dialog-actions">
            <button
              className="secondary-button"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button className="primary-button" type="submit">
              <Plus size={18} />
              Save Birthday
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function BirthdayCard({ birthday }) {
  const days = getDaysUntilBirthday(birthday);
  const age = getTurningAge(birthday);

  return (
    <div className="birthday-row">
      <div className="person-avatar">
        {getInitials(birthday.name)}
      </div>

      <div className="person-details">
        <h3 className="person-name">
          {birthday.name}
        </h3>

        <p className="person-meta">
          {birthday.category} · Turning {age}
        </p>
      </div>

      <div className="birthday-date">
        {days === 0 ? (
          <span className="today-label">
            Today
          </span>
        ) : (
          <p className="birthday-countdown">
            {days} {days === 1 ? "day" : "days"}
          </p>
        )}

        <p className="birthday-day">
          {birthday.day}/{birthday.month}
        </p>
      </div>
    </div>
  );
}

function App() {
  const { currentUser, loading, authError, signOut } = useAuth();

  const [birthdayDataByUser, setBirthdayDataByUser] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [signOutError, setSignOutError] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const userId = currentUser?.uid;
  const birthdayData = useMemo(() => {
    if (!userId) {
      return { birthdays: mockBirthdays, loaded: false, error: "" };
    }

    return birthdayDataByUser[userId] ?? loadBirthdayData(userId);
  }, [birthdayDataByUser, userId]);
  const { birthdays, error: birthdayStorageError, loaded: birthdaysLoaded } =
    birthdayData;

  function handleAddBirthday(birthday) {
    if (!birthdaysLoaded || birthdayStorageError || !isBirthdayEntry(birthday)) {
      return;
    }

    const newBirthday = {
      ...birthday,
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      isCustom: true,
    };
    const updatedBirthdays = [...birthdays, newBirthday];
    const savedBirthdays = updatedBirthdays.filter(
      (item) => item.isCustom
    );

    try {
      localStorage.setItem(
        getBirthdayStorageKey(userId),
        JSON.stringify(savedBirthdays)
      );
      setBirthdayDataByUser((current) => ({
        ...current,
        [userId]: { birthdays: updatedBirthdays, loaded: true, error: "" },
      }));
      setIsAddDialogOpen(false);
    } catch (error) {
      setBirthdayDataByUser((current) => ({
        ...current,
        [userId]: {
          ...birthdayData,
          error: `Could not save this birthday in this browser: ${error.message}`,
        },
      }));
    }
  }

  async function handleSignOut() {
    setSignOutError("");

    try {
      await signOut();
    } catch (error) {
      setSignOutError(error.message);
    }
  }

  const todayBirthdays = useMemo(
    () =>
      birthdays.filter(
        (birthday) => getDaysUntilBirthday(birthday) === 0
      ),
    [birthdays]
  );

  const upcomingBirthdays = useMemo(
    () =>
      [...birthdays]
        .filter(
          (birthday) => getDaysUntilBirthday(birthday) !== 0
        )
        .sort(
          (a, b) =>
            getDaysUntilBirthday(a) -
            getDaysUntilBirthday(b)
        ),
    [birthdays]
  );

  const filteredBirthdays = upcomingBirthdays.filter(
    (birthday) =>
      birthday.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      birthday.category
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const greetingName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "there";

  if (loading || (currentUser && !birthdaysLoaded)) {
    return (
      <main className="loading-screen">
        <LoaderCircle size={28} />
        <p>Loading your account...</p>
      </main>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="app-shell">
        <aside className="sidebar">

          <div className="brand">
            <div className="brand-mark">
              <Cake size={22} />
            </div>

            <div>
              <h1 className="brand-name">
                Birthday Reminder
              </h1>
              <p className="brand-caption">
                Celebrate every moment
              </p>
            </div>
          </div>

          <nav className="side-nav">

            <a
              href="#/"
              className="nav-link active"
            >
              <LayoutDashboard size={19} />
              Dashboard
            </a>

            <a
              href="#/birthdays"
              className="nav-link"
            >
              <Calendar size={19} />
              Birthdays
            </a>

            <a
              href="#/settings"
              className="nav-link"
            >
              <Settings size={19} />
              Settings
            </a>

          </nav>

          <div className="sidebar-note">
            <Gift size={24} />

            <h3>Make someone feel special  on there special day</h3>

            <p>
              A birthday wish can make a special day even better and worth celebrating.
            </p>
          </div>

        </aside>

       
        <main className="main-area">

         
          <header className="topbar">

            <div>
              <h2>
                Dashboard
                <span className="breadcrumb-separator">
                  <ChevronRight size={14} />
                </span>
                <span className="breadcrumb-current">
                  Overview
                </span>
              </h2>

              <p>
            OVERVIEW
              </p>

            </div>

            <div className="topbar-actions">
              <div className="user-avatar">
                {getInitials(greetingName)}
              </div>

              <button
                type="button"
                className="sign-out-button"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>

          </header>

          <div className="dashboard-content">
            <section className="welcome-section">

              <div>
                <h1 className="welcome-title">
                  Welcome, {greetingName}!
                </h1>

                <p className="welcome-copy">
              Happening with your birthdays.
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                disabled={Boolean(birthdayStorageError)}
                title={
                  birthdayStorageError
                    ? "Birthday storage is unavailable"
                    : undefined
                }
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus size={18} />
                Add Birthday
              </button>

            </section>

            {(signOutError || authError) && (
              <div className="auth-error">
                Authentication error: {signOutError || authError}
              </div>
            )}

            {birthdayStorageError && (
              <p className="birthday-storage-error" role="alert">
                {birthdayStorageError}
              </p>
            )}

            
            <section className="stats-grid">

              <StatCard
                title="Total Birthdays"
                value={birthdays.length}
                description="Saved birthday records"
                icon={Users}
              />

              <StatCard
                title="Today's Birthdays"
                value={todayBirthdays.length}
                description="People celebrating today"
                icon={Cake}
              />

              <StatCard
                title="Upcoming Birthdays"
                value={upcomingBirthdays.length}
                description="People with upcoming birthdays"
                icon={CalendarDays}
              />

              <StatCard
                title="Categories"
                value={
                  new Set(
                    birthdays.map((item) => item.category)
                  ).size
                }
                description="Different contact groups"
                icon={Heart}
              />

            </section>
            <section className="content-card">

              <div className="section-heading">
                <div>
                  <h2>
                    Today's Birthdays
                  </h2>

                  <p>
                    Don't forget to send your loved ones ,coleagues and family there wishes and gifts.
                  </p>
                </div>

                <Gift className="section-icon" />
              </div>

              {todayBirthdays.length > 0 ? (
                <div className="birthday-list">
                  {todayBirthdays.map((birthday) => (
                    <BirthdayCard
                      key={birthday.id}
                      birthday={birthday}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Cake size={30} />

                  <p>
                    No one of your friends is celebrating their birthday today
                  </p>

                  <p>
                    Your friends birthday is coming soon.
                  </p>
                </div>
              )}

            </section>
            <section className="content-card">

              <div className="section-heading with-search">

                <div>
                  <h2>
                    Upcoming Birthdays
                  </h2>

                  <p>
                    Keep track of your circles celebrations
                  </p>
                </div>

                <div className="search-wrap">

                  <Search className="search-icon" size={16} />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search birthdays..."
                    aria-label="Search birthdays"
                    className="search-input"
                  />
                </div>

              </div>

              {filteredBirthdays.length > 0 ? (
                <div className="birthday-list">
                  {filteredBirthdays.map((birthday) => (
                    <BirthdayCard
                      key={birthday.id}
                      birthday={birthday}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Search size={30} />

                  <p>
                    No matching birthdays found.
                  </p>
                </div>
              )}

            </section>

            <footer className="app-footer">
              Birthday Reminder
            </footer>

          </div>

        </main>
        {isAddDialogOpen && (
          <AddBirthdayDialog
            error={birthdayStorageError}
            onClose={() => setIsAddDialogOpen(false)}
            onSubmit={handleAddBirthday}
          />
        )}
    </div>
  );
}

export default App;