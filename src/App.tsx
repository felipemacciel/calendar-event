import React from 'react';
import moment from 'moment';
import "../src/CalendarEvent.css"
import { Modal } from '@fluentui/react';
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

moment.locale('pt-br');
const localizer = momentLocalizer(moment);


interface ICalendarItem {
  name: string;
  date: Date;
  localName: string;
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  resource: ICalendarItem;
}

export default function App(): JSX.Element {
  const monthsNames: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weeklyDay: string[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']


  const [events, setEvents] = React.useState<ICalendarItem[]>([]);
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = React.useState<ICalendarItem>();

  React.useEffect(() => {
    fetch('https://date.nager.at/api/v3/publicholidays/2024/BR')
      .then((response) => response.json())
      .then((data) => {
        const fetchedEvents = Array.isArray(data) ? data.map((item: any) => {
          const date = new Date(item.date);
          date.setHours(date.getHours() + (date.getTimezoneOffset() / 60));
          return {
            name: item.localName,
            date: date,
            localName: item.localName,
          };
        }) : [];
        setEvents(fetchedEvents);
      })
      .catch((error) => console.log('Erro ao buscar eventos', error));
  }, []);

  const calendarStyle = (date: Date) => {
    const haveEvents = events.some((item) => (
      item.date.getDate() === date.getDate() &&
      item.date.getMonth() === date.getMonth() &&
      item.date.getFullYear() === date.getFullYear()
    ));
  
    if (haveEvents) {
      return {
        className: 'caledar-bg-day-have-event'
      };
    }
    return {}; 
  };

  const onSelectEvent = (event: CalendarEvent): void => {
    setSelectedEvent(event.resource);
    setShowDialog(true);
  };
  const messages = {
    date: "Data",
    time: "Hora",
    event: "Evento",
    allDay: "Dia Todo",
    week: "Semana",
    work_week: "Eventos",
    day: "Dia",
    month: "Mês",
    previous: "Anterior",
    next: "Próximo",
    yesterday: "Ontem",
    tomorrow: "Amanhã",
    today: "Hoje",
    agenda: "Agenda",
    noEventsInRange: "Não há eventos no período.",
    showMore: (total:number) => `+${total} Ver mais`
  }
  const calendarEvents: CalendarEvent[] = events.map(event => ({
    title: event.name,
    start: event.date,
    end: event.date,
    resource: event,
  }));

  return (
    <>
      {events.length > 0 && (
        <>
          <Calendar
            localizer={localizer}
            messages={messages}
            events={calendarEvents}
            dayPropGetter={calendarStyle}
            popup={true}
            onSelectEvent={onSelectEvent}
            style={{ height: 500, margin: "50px" }} 
          />
          <Modal
            isOpen={showDialog}
            onDismiss={() => setShowDialog(false)}
            className='modal-event-calendar-detail page-calendar'
          >
            <div className='event-item-modal-container page-calendar'>
              <div className="event-item-month page-calendar">
                {selectedEvent?.date ? monthsNames[new Date(selectedEvent.date).getMonth()] : ''}
              </div>
              <div className={`calendar-item page-calendar ${selectedEvent?.date && new Date(selectedEvent.date).getDate() === new Date().getDate() ? 'active' : ''}`}>
                <div className="calendar-item-date page-calendar">
                  <div className="calendar-item-date-number page-calendar">
                    {selectedEvent?.date && new Date(selectedEvent.date).getDate() >= 10 
                      ? new Date(selectedEvent.date).getDate() 
                      : `0${selectedEvent?.date ? new Date(selectedEvent.date).getDate() : ''}`}
                  </div>
                  <div className="calendar-item-date-weekly page-calendar">
                    {selectedEvent?.date ? weeklyDay[new Date(selectedEvent.date).getDay()] : ''}
                  </div>                  
                </div>
                <div className="calendar-item-title page-calendar">
                {selectedEvent?.name}</div>
              </div>
            </div>         
          </Modal>
        </>
      )}
    </>
  );
}