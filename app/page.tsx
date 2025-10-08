import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">banner.az</h1>
            <div className="space-x-4">
              <Link href="/boards" className="text-gray-700 hover:text-indigo-600">
                Lövhələr
              </Link>
              <Link href="/admin" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                Lövhə Yerləşdir
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
            Reklam Lövhələrinizdən Gəlir əldə edin
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Reklamçıları premium reklam yerləri ilə birləşdirin.
            Reklam lövhələrinizi siyahıya əlavə edin, qiymətlərinizi təyin edin və qazanmağa başlayın.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/boards"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
            >
              Lövhə Tap
            </Link>
            <Link
              href="/admin"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition"
            >
              Lövhə Yerləşdir
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-4">📍</div>
            <h3 className="text-xl font-semibold mb-2">Məkan Əsaslı</h3>
            <p className="text-gray-600">
              Dəqiq GPS koordinatları ilə lövhələr tapın. Rayon, məhəllə və ya dəqiq məkan üzrə axtarış edin.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-4">📸</div>
            <h3 className="text-xl font-semibold mb-2">Vizual Siyahı</h3>
            <p className="text-gray-600">
              Hər lövhənin yüksək keyfiyyətli şəkilləri. Rezerv etməzdən əvvəl dəqiq olaraq nə aldığınızı görün.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Sadə Qiymətləndirmə</h3>
            <p className="text-gray-600">
              Gün, həftə və ya ay üzrə şəffaf qiymətlər. Dərhal rezerv edin və reklamınıza başlayın.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
