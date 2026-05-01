import { redirect } from 'next/navigation';

export default function SpeakersIndex() {
  redirect('/people?tab=speakers');
}
