import { PushNotificationToggle } from '@/components/dashboard/PushNotificationToggle'

export default function StudentSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="font-bold">Notificações</h2>
        <p className="mt-1 text-sm text-slate-500">Receba um aviso quando uma nova aula for publicada.</p>
        <div className="mt-4">
          <PushNotificationToggle />
        </div>
      </div>
    </div>
  )
}
