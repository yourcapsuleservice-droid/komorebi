interface Report {
  id: string;
  mangaId: string;
  mangaTitle: string;
  userId: string;
  reason: string;
  date: string;
  status: 'pending' | 'resolved';
}

export default Report;