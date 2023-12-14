import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import * as moment from 'moment';

export interface data {
  transAmount: number;
  transDate: any;
}

@Injectable({
  providedIn: 'root',
})
export class StatService {
  dictFileSizeUnits: any = { tb: 'TB', gb: 'GB', mb: 'MB', kb: 'KB', b: 'b' };
  filesizeBase: number = 1000;
  lanchDate: string = '04-07-2022';
  plans = [
    {
      amount: '0',
      plan_name: 'All',
    },
    {
      amount: '1000',
      plan_name: 'Premium',
    },
    {
      amount: '500',
      plan_name: 'Basic',
    },
    {
      amount: '200',
      plan_name: 'Starter',
    },
    {
      amount: '0',
      plan_name: 'Any Amount',
    },
  ];

  constructor(private datePipe: DatePipe) {}

  getBestStat(array: Array<any>, total: number) {
    let result = Object.values(
      array.reduce(
        (
          c: any,
          { accountNo, firstName, lastName, customerId, transAmount }: any
        ) => {
          c[accountNo] = c[accountNo] || {
            accountNo,
            firstName,
            lastName,
            customerId,
            percent: 0,
            transAmount: 0,
          };
          c[accountNo].transAmount += Number(transAmount);
          c[accountNo].percent =
            (Number(c[accountNo].transAmount) / total) * 100;
          return c;
        },
        {}
      )
    );
    //result.sort((a:any, b:any) =>  b - a);
    const data = result.sort(
      (a: any, b: any) => b?.transAmount - a?.transAmount
    );
    return data;
  }

  getBestAccountHolder(array: Array<any>, total: number) {
    let result = Object.values(
      array.reduce(
        (
          c: any,
          {
            accountNo,
            firstName,
            lastName,
            customerId,
            transAmount,
            transType,
          }: any
        ) => {
          c[accountNo] = c[accountNo] || {
            accountNo,
            firstName,
            lastName,
            customerId,
            percent: 0,
            balance: 0,
            savings: 0,
            withdraw: 0,
            commission: 0,
          };
          if (transType === 'Savings')
            c[accountNo].savings += Number(transAmount);
          if (transType === 'Withdrawal')
            c[accountNo].withdraw += Number(transAmount);
          if (transType === 'commission')
            c[accountNo].commission += Number(transAmount);
          c[accountNo].balance = Number(
            c[accountNo].savings - c[accountNo].withdraw
          );
          c[accountNo].percent = (Number(c[accountNo].balance) / total) * 100;
          return c;
        },
        {}
      )
    );
    const data = result.sort((a: any, b: any) => b?.balance - a?.balance);
    return data;
  }

  getFilesize(size: number, html?: boolean) {
    var selectedSize = 0;
    var selectedUnit = 'b';
    if (size > 0) {
      var units = ['tb', 'gb', 'mb', 'kb', 'b'];
      for (var i = 0; i < units.length; i++) {
        var unit = units[i];
        var cutoff = Math.pow(this.filesizeBase, 4 - i) / 10;
        if (size >= cutoff) {
          selectedSize = size / Math.pow(this.filesizeBase, 4 - i);
          selectedUnit = unit;
          break;
        }
      }
      selectedSize = Math.round(10 * selectedSize) / 10; // Cutting of digits
    }

    return html == true
      ? '<strong>'
          .concat(selectedSize.toString(), '</strong> ')
          .concat(this.dictFileSizeUnits[selectedUnit])
      : selectedSize.toString().concat(this.dictFileSizeUnits[selectedUnit]);
  }

  getDailyTransactions(record: Array<object>) {
    //Filter Today's transactions
    const today = this.datePipe.transform(
      new Date().setDate(new Date().getDate()),
      'yyyy-MM-dd'
    );
    const data = record.filter((d: any) => d.transDate == today);
    return data;
  }

  getMonthlyTransactions(record: Array<object>) {
    //Filter this month transactions
    const startOfMonth = moment().startOf('month').format();
    const endOfMonth = moment().endOf('month').format();
    const data = record.filter(
      (m: any) =>
        new Date(m.transDate + ' ' + m.time) >= new Date(startOfMonth) &&
        new Date(m.transDate + ' ' + m.time) <= new Date(endOfMonth)
    );
    return data;
  }

  getWeeklyTransactions(record: Array<object>) {
    const startOfWeek = moment().startOf('week').format();
    const endOfWeek = moment().endOf('week').format();
    const data = record.filter(
      (w: any) =>
        new Date(w.transDate + ' ' + w.time) >= new Date(startOfWeek) &&
        new Date(w.transDate + ' ' + w.time) <= new Date(endOfWeek)
    );
    return data;
  }

  getYesterdayTransactions(record: Array<object>) {
    moment();
    const yesterday = moment()
      .subtract(1, 'days')
      .startOf('day')
      .format('YYYY-MM-DD');
    const data = record.filter((d: any) => d.transDate === yesterday);
    return data;
  }

  getTransactionsByDays(record: Array<object>, dayNumber: number) {
    const day = moment()
      .subtract(dayNumber - 1, 'days')
      .format('YYYY-MM-DD');
    const data = record.filter((d: any) => d.transDate == day);
    return data;
  }

  calculateTransactions(record: Array<object>) {
    //calculate the total savings per day
    const data = record.reduce(
      (sum: any, current: any) => sum + Number(current.transAmount),
      0
    );
    return data;
  }

  getMonthlyCustomers(record: Array<object>) {
    //Filter this month customers
    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
    const data = record.filter(
      (m: any) =>
        new Date(m.date_registered) >= new Date(startOfMonth) &&
        new Date(m.date_registered) <= new Date(endOfMonth)
    );
    return data;
  }

  getMonthDate() {
    const currentMonthDates = new Array(moment().daysInMonth())
      .fill(null)
      .map((x, i) => moment().startOf('month').add(i, 'days').format('MMM D'));
    return currentMonthDates;
  }

  getLastDays(num: number) {
    const lastdays = new Array(num).fill(null).map((x, i) =>
      moment()
        .subtract(num - 1, 'days')
        .add(i, 'days')
        .format('MMM D YYYY')
    );
    return lastdays;
  }

  getTransactionByDays(array: Array<any>): any {
    const result = Object.values(
      array.reduce((acc, { transDate, transType, transAmount }) => {
        acc[transDate] = acc[transDate] || {
          transDate,
          savings: 0,
          withdraw: 0,
        };
        if (transType === 'Savings')
          acc[transDate].savings += Number(transAmount);
        if (transType === 'Withdrawal')
          acc[transDate].withdraw += Number(transAmount);
        return acc;
      }, {})
    );
    const data = result.reverse();

    return data;
  }

  getNumberOfDaysTransaction(record: Array<object>, num: number) {
    const startDate = moment()
      .subtract(num - 1, 'days')
      .format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');
    const data = record.filter(
      (m: any) =>
        new Date(m.transDate) >= new Date(startDate) &&
        new Date(m.transDate) <= new Date(endDate)
    );

    return data;
  }

  getNumberOfMonthTransaction(record: Array<object>, num: number) {
    const startDate = moment()
      .subtract(num - 1, 'month')
      .startOf('month')
      .format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');
    const data = record.filter(
      (m: any) =>
        new Date(m.transDate) >= new Date(startDate) &&
        new Date(m.transDate) <= new Date(endDate)
    );
    this.test(record, startDate, endDate);
    return data;
  }

  test(record: Array<any>, start: string, end: string) {
    //
    const startDate = moment(start);
    const endDate = moment(end);
    const months = [];
    const monthslyTranx = [];
    if (endDate.isBefore(startDate)) {
      throw Error('End date must be greater than start date.');
    }
    while (startDate.isBefore(endDate)) {
      months.push({
        startDate: startDate.startOf('month').format('YYYY-MM-DD'),
        endDate: startDate.endOf('month').format('YYYY-MM-DD'),
      });
      startDate.add(1, 'month');
    }
    for (let i = 0; i < months.length; i++) {
      const element = months[i];
      const data = record.filter(
        (m: any) =>
          new Date(m.transDate) >= new Date(element?.startDate) &&
          new Date(m.transDate) <= new Date(element?.endDate)
      );
      monthslyTranx.push(data);
    }
  }

  getLast12MonthsTransaction(record: Array<object>) {
    const last12Months = moment().subtract(12, 'months').startOf('month');
    let result = record.filter((o: any) =>
      moment(o?.transDate, 'YYYY-MM-DD').isBetween(last12Months, moment())
    );
    return result;
  }

  getLast12MonthsTransactionValues(record: Array<any>) {
    const result = record.reduce((r, { transType, transDate, transAmount }) => {
      let yearMonth1 = transDate.substring(0, 7); // get year and month
      let yearMonth = moment(yearMonth1).format('MMMM YYYY');
      if (!r[transType]) r[transType] = { transType, sum: {} };
      if (!r[transType].sum[yearMonth]) r[transType].sum[yearMonth] = 0;
      r[transType].sum[yearMonth] += Number(transAmount);
      return r;
    }, {});
    const data = Object.values(result).map(({ transType, sum }: any) => {
      let totalPerMonth = Object.entries(sum).map(([month, sum]) => ({
        month: moment(month).format('MMMM YYYY'),
        totalMonthlyValue: Number(sum),
      }));
      return { transType, totalPerMonth };
    }, {});

    return data;
  }

  getTotalTrnxValuesByMonth(
    elements: Array<any>,
    startDate?: Date,
    endDate?: Date
  ) {
    const result = elements.reduce((previous, current) => {
      const yearMonth = moment(current.transDate).format('MMM YYYY');
      let newRecord = previous.find((e: any) => e.month === yearMonth);
      if (!newRecord) {
        newRecord = {
          month: yearMonth,
          savings: 0,
          withdrawal: 0,
          commission: 0,
        };
        previous.push(newRecord);
      }
      if (current.transType === 'Savings')
        newRecord.savings += Number(current.transAmount);
      if (current.transType === 'Withdrawal')
        newRecord.withdrawal += Number(current.transAmount);
      if (current.transType === 'commission')
        newRecord.commission += Number(current.transAmount);
      return previous;
    }, []);
    const data = result.reverse();
    const filteredData = startDate
      ? this.filterDate(data, startDate!, endDate!)
      : data;
    return startDate ? filteredData : data.slice(-12);
  }

  getTotalTrnxsVolumesByMonth(
    elements: Array<any>,
    startDate?: Date,
    endDate?: Date
  ) {
    const result = elements.reduce((previous, current) => {
      const yearMonth = moment(current.transDate).format('MMM YYYY');
      let newRecord = previous.find((e: any) => e.month === yearMonth);
      if (!newRecord) {
        newRecord = {
          month: yearMonth,
          savings: 0,
          withdrawal: 0,
          commission: 0,
        };
        previous.push(newRecord);
      }
      if (current.transType === 'Savings') newRecord.savings++;
      if (current.transType === 'Withdrawal') newRecord.withdrawal++;
      if (current.transType === 'commission') newRecord.commission++;
      return previous;
    }, []);
    const data = result.reverse();
    const filteredData = startDate
      ? this.filterDate(data, startDate!, endDate!)
      : data;
    return startDate ? filteredData : data.slice(-12);
  }

  getTotalUsersByMonth(elements: Array<any>, startDate?: Date, endDate?: Date) {
    const result = elements.reduce((previous, current) => {
      const yearMonth = moment(current.date_registered).format('MMM YYYY');
      let newRecord = previous.find((e: any) => e.month === yearMonth);
      if (!newRecord) {
        newRecord = { month: yearMonth, users: 0 };
        previous.push(newRecord);
      }
      newRecord.users++;
      return previous;
    }, []);
    const data = result;
    const filteredData = startDate
      ? this.filterDate(data, startDate!, endDate!)
      : data;
    return startDate ? filteredData : data.slice(-12);
  }

  addOpacity(color: string): string {
    return color.replace(')', ', 0.5)').replace('rgb', 'rgba');
  }

  generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
      Math.random() * 256
    )}, ${Math.floor(Math.random() * 256)})`;
  }

  // Number of women and men that saved monthly
  getTotalSavingsVolumeByGenderPerMonth(
    elements: Array<any>,
    startDate?: Date,
    endDate?: Date
  ) {
    const result = elements.reduce((previous, current) => {
      const yearMonth = moment(current.transDate).format('MMM YYYY');
      let newRecord = previous.find((e: any) => e.month === yearMonth);
      if (!newRecord) {
        newRecord = { month: yearMonth, male: 0, female: 0, unspecified: 0 };
        previous.push(newRecord);
      }
      if (current.gender === 'Male') newRecord.male++;
      if (current.gender === 'Female') newRecord.female++;
      if (
        current.gender === '' ||
        current.gender !== 'Male' ||
        current.gender !== 'Female' ||
        current.gender === null
      )
        newRecord.unspecified++;
      return previous;
    }, []);
    const value = result.reverse();
    const data = value.slice(-12);
    const filteredData = startDate
      ? this.filterDate(value, startDate!, endDate!)
      : data;
    return startDate ? filteredData : data;
  }

  filterDate(data: Array<any>, startDate: Date, endDate: Date) {
    const filteredArray = data.filter((item: any) => {
      const month = moment(item.month, 'MMM YYYY');
      const startFilter = moment(startDate, 'MMM YYYY');
      const endFilter = moment(endDate, 'MMM YYYY');
      return month.isBetween(startFilter, endFilter, null, '[]'); // '[]' includes start and end months
    });
    return filteredArray;
  }

  //get average Savings and withdrawls per month
  getAverageByMonth(elements: Array<any>, selectedMonth?: string) {
    const result = elements.reduce((previous, current) => {
      const yearMonth = moment(current.transDate).format('MMM YYYY');
      const currentMonth = moment(selectedMonth).format('MMM YYYY');
      let newRecord = previous.find((e: any) => e.month === currentMonth);
      if (!newRecord) {
        newRecord = {
          month: currentMonth,
          totalSavings: 0,
          savingsVolume: 0,
          totalWithdrawal: 0,
          WithdrawalVolume: 0,
        };
        previous.push(newRecord);
      }
      if (current.transType === 'Savings' && yearMonth === currentMonth)
        newRecord.totalSavings += Number(current.transAmount);
      if (current.transType === 'Savings' && yearMonth === currentMonth)
        newRecord.savingsVolume++;
      if (current.transType === 'Withdrawal' && yearMonth === currentMonth)
        newRecord.totalWithdrawal += Number(current.transAmount);
      if (current.transType === 'Withdrawal' && yearMonth === currentMonth)
        newRecord.WithdrawalVolume++;
      return previous;
    }, []);
    const data = result.reverse();
    return data;
  }

  getTicketSoldByAmount(array: Array<any>, total: number) {
    let result = Object.values(
      array.reduce((c: any, { email, fname, lname, user_id, amount }: any) => {
        c[email] = c[email] || {
          email,
          fname,
          lname,
          user_id,
          percent: 0,
          length: 0,
          amount: 0,
        };
        c[email].amount += Number(amount);
        c[email].length++;
        c[email].percent = (Number(c[email].amount) / total) * 100;
        return c;
      }, {})
    );
    const data = result.sort((a: any, b: any) => b?.amount - a?.amount);
    return data;
  }

  getTicketSoldByCategory(array: Array<any>) {
    let result = Object.values(
      array.reduce((c: any, { ticket_class, amount, used }: any) => {
        c[ticket_class] = c[ticket_class] || {
          ticket_class,
          percentNumber: 0,
          percentAmount: 0,
          length: 0,
          used: 0,
          unused: 0,
          amount: 0,
        };
        c[ticket_class].length++;
        if (used === '0') c[ticket_class].unused++;
        if (used === '1') c[ticket_class].used++;
        c[ticket_class].amount += Number(amount);
        c[ticket_class].percentNumber =
          Number(c[ticket_class].length / array.length) * 100;
        c[ticket_class].percentAmount =
          Number(c[ticket_class].amount / array.length) * 100;
        return c;
      }, {})
    );
    const data = result.sort((a: any, b: any) => b?.amount - a?.amount);
    return data;
  }

  getTicketSoldByChannel(array: Array<any>, total: number) {
    let result = Object.values(
      array.reduce((c: any, { payment_channel, amount }: any) => {
        c[payment_channel] = c[payment_channel] || {
          payment_channel,
          length: 0,
          percent: 0,
          amount: 0,
        };
        c[payment_channel].amount += Number(amount);
        c[payment_channel].length++;
        c[payment_channel].percent =
          (Number(c[payment_channel].amount) / total) * 100;
        return c;
      }, {})
    );
    const data = result.sort((a: any, b: any) => b?.amount - a?.amount);
    return data;
  }

  // getTicketTrnxByDays(array: Array<any>): any{
  //   const result = Object.values(array.reduce((acc, {transDate, payment_channel, transAmount}) => {
  //     acc[transDate] = acc[transDate] || {transDate, savings: 0, withdraw:0};
  //     if (payment_channel === "POS") acc[transDate].savings += Number(transAmount);
  //     if (payment_channel === "Cash") acc[transDate].withdraw += Number(transAmount);
  //     return acc;
  //   }, {}));
  //   const data = result.reverse();
  //   console.log(data);
  //   return data;
  // }

  getTicketTrnxByDays(elements: Array<any>) {
    const result = elements.reduce((previous, current) => {
      const yearMonth = moment(current.buy_date_time).format('MMM D YYYY');
      let newRecord = previous.find((e: any) => e.date === yearMonth);
      if (!newRecord) {
        newRecord = { date: yearMonth, pos: 0, cash: 0, others: 0 };
        previous.push(newRecord);
      }
      if (current.payment_channel === 'POS')
        newRecord.pos += Number(current.amount);
      if (current.payment_channel === 'Cash')
        newRecord.cash += Number(current.amount);
      if (
        current.payment_channel === '' ||
        current.payment_channel === 'Paystack'
      )
        newRecord.others += Number(current.amount);
      return previous;
    }, []);
    const data = result; ///.reverse();
    return data;
  }

  getDateRanges() {
    // get an array of all the date ranges
    const data = [
      {
        timeline: 'All',
        date: [moment(this.lanchDate).startOf('day'), moment().endOf('day')],
      },
      {
        timeline: 'Today',
        date: [moment().startOf('day'), moment().endOf('day')],
      },
      {
        timeline: 'Yesterday',
        date: [
          moment().subtract(1, 'days').startOf('day'),
          moment().subtract(1, 'days').endOf('day'),
        ],
      },
      {
        timeline: 'Last 7 Days',
        date: [
          moment().subtract(6, 'days').startOf('day'),
          moment().endOf('day'),
        ],
      },
      {
        timeline: 'Last 30 Days',
        date: [
          moment().subtract(29, 'days').startOf('day'),
          moment().endOf('day'),
        ],
      },
      {
        timeline: 'This Month',
        date: [
          moment().startOf('month').startOf('day'),
          moment().endOf('month').endOf('day'),
        ],
      },
      {
        timeline: 'Last Month',
        date: [
          moment().subtract(1, 'month').startOf('month').startOf('day'),
          moment().subtract(1, 'month').endOf('month').endOf('day'),
        ],
      },
      {
        timeline: 'Custom Range',
        date: [],
      },
    ];
    return data;
  }

  generateYears() {
    const startYear = moment(this.lanchDate).year();
    const currentYear = moment().year();
    const years = [];

    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  }

  getYearRanges() {
    // get an array of all the year ranges
    const data = [
      {
        timeline: 'Last 6 Months',
        date: [
          moment().subtract(5, 'month').startOf('month').startOf('day'),
          moment().endOf('month').endOf('day'),
        ],
      },
      {
        timeline: 'Last 12 Months',
        date: [
          moment().subtract(11, 'months').startOf('month'),
          moment().endOf('month'),
        ],
      },
      {
        timeline: 'Last Year',
        date: [
          moment().subtract(1, 'year').startOf('year').startOf('month'),
          moment().subtract(1, 'year').endOf('year').endOf('month'),
        ],
      },
      {
        timeline: 'This Year',
        date: [
          moment().startOf('year').startOf('month'),
          moment().endOf('year').endOf('month'),
        ],
      },
    ];
    return data;
  }
}
