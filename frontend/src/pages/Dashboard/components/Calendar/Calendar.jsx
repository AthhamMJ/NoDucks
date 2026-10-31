import { useState } from "react";
import styles from "./Calendar.module.css";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();

  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button onClick={previousMonth}>‹</button>

        <h2>
          {monthName} {year}
        </h2>

        <button onClick={nextMonth}>›</button>
      </div>

      <div className={styles.weekdays}>
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      <div className={styles.days}>
        {days.map((day, index) => {
          const isToday =
            day &&
            year === todayYear &&
            month === todayMonth &&
            day === todayDate;

          return (
            <span
              key={index}
              className={
                isToday ? styles.today : day ? styles.day : styles.empty
              }
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
