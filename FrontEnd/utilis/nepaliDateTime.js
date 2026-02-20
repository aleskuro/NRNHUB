import { useState, useEffect, useRef } from 'react';

const DATE_API = "https://calendar.bloggernepal.com/api/today";

const nepaliNumerals = {
  '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
  '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
};

const toNepaliNumerals = (str) =>
  str.split('').map((char) => nepaliNumerals[char] || char).join('');

const nepaliMonths = {
  '01': 'बैशाख',
  '02': 'जेठ',
  '03': 'असार',
  '04': 'साउन',
  '05': 'भदौ',
  '06': 'असोज',
  '07': 'कार्तिक',
  '08': 'मंसिर',
  '09': 'पुस',
  '10': 'माघ',
  '11': 'फाल्गुन',
  '12': 'चैत',
};

// Reverse lookup: Nepali month name to month number
const nepaliMonthNameToNumber = {
  'बैशाख': '01',
  'जेठ': '02',
  'असार': '03',
  'साउन': '04',
  'भदौ': '05',
  'असोज': '06',
  'कार्तिक': '07',
  'मंसिर': '08',
  'पुस': '09',
  'माघ': '10',
  'फाल्गुन': '11',
  'चैत': '12',
};

export const useNepaliDate = () => {
  const [englishDate, setEnglishDate] = useState("Loading...");
  const [nepaliBsDate, setNepaliBsDate] = useState("Loading...");
  const [error, setError] = useState(null);
  const [nextMonth, setNextMonth] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const fetchNepaliDate = async () => {
      try {
        const res = await fetch(DATE_API);
        const data = await res.json();

        if (!isMounted.current) return;

        if (data.message === "Success" && data.res) {
          const { year, name, days } = data.res;
          const todayObj = days.find((d) => d.tag === "today");

          if (todayObj) {
            const { bs } = todayObj;
            
            // Get current month from API response
            const currentMonthName = name;
            const currentMonth = nepaliMonthNameToNumber[currentMonthName] || '08';
            
            const englishDateStr = new Date().toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
              timeZone: 'Asia/Kathmandu',
            });
            const nepaliBsDateStr = `${toNepaliNumerals(bs)} ${currentMonthName}, ${toNepaliNumerals(year)}`;

            const nextMonthNum = (parseInt(currentMonth) % 12) + 1;
            const nextMonthStr = nextMonthNum.toString().padStart(2, '0');
            const nextMonthName = nepaliMonths[nextMonthStr];

            if (isMounted.current) {
              setEnglishDate(englishDateStr);
              setNepaliBsDate(nepaliBsDateStr);
              setNextMonth(`अर्को महिना: ${nextMonthName}`);
            }
          } else {
            const englishDateStr = new Date().toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
              timeZone: 'Asia/Kathmandu',
            });
            if (isMounted.current) {
              setEnglishDate(englishDateStr);
              setNepaliBsDate(`${toNepaliNumerals('02')} ${nepaliMonths['08']}, ${toNepaliNumerals('2082')}`);
              setNextMonth(`अर्को महिना: ${nepaliMonths['09']}`);
              setError(new Error("No 'today' tag found, using fallback date"));
            }
          }
        } else {
          throw new Error("Invalid API structure");
        }
      } catch (err) {
        if (!isMounted.current) return;
        console.error("Nepali Date Fetch Error:", err.message);
        const englishDateStr = new Date().toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
          timeZone: 'Asia/Kathmandu',
        });
        if (isMounted.current) {
          setEnglishDate(englishDateStr);
          setNepaliBsDate('(नेपाली मिति उपलब्ध छैन)');
          setNextMonth(`अर्को महिना: ${nepaliMonths['09']}`);
          setError(err);
        }
      }
    };

    fetchNepaliDate();

    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
    let intervalId = null;

    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        fetchNepaliDate();
        intervalId = setInterval(() => {
          if (isMounted.current) fetchNepaliDate();
        }, 24 * 60 * 60 * 1000);
      }
    }, msUntilMidnight);

    return () => {
      isMounted.current = false;
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return { englishDate, nepaliBsDate, nextMonth, error };
};

export const useNepaliTime = () => {
  const [nepaliTime, setNepaliTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'Asia/Kathmandu',
      });
      setNepaliTime(`वर्तमान समय: ${timeString}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return { nepaliTime };
};