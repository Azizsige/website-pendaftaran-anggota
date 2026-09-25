import Link from 'next/link';

export default function AdminHeader() {
  return (
    <header className="bg-surface dark:bg-surface-container docked full-width top-0 bg-surface-container-low dark:bg-surface-container-high flat no shadows z-10 sticky">
      <div className="flex justify-between items-center w-full px-lg h-16 max-w-container-max mx-auto">
        <div className="flex items-center gap-md">
          <button className="md:hidden text-on-surface-variant p-sm hover:bg-surface-variant/50 rounded-full transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex text-body-sm font-body-sm text-on-surface-variant">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link className="inline-flex items-center hover:text-primary transition-colors" href="/admin">
                  Admin
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
                  <span className="text-on-surface font-semibold ml-1 md:ml-2">Dashboard</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        <div className="flex items-center gap-lg">
          {/* Search */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
            </div>
            <input className="block w-full p-2 pl-10 text-body-sm font-body-sm text-on-surface bg-surface-container-lowest border border-outline-variant/50 rounded-full focus:ring-primary focus:border-primary" id="search-navbar" placeholder="Search members..." type="text" />
          </div>
          <div className="flex items-center gap-sm">
            <button className="p-sm text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors relative cursor-pointer active:opacity-70">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="p-sm text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors cursor-pointer active:opacity-70">
              <span className="material-symbols-outlined">mail</span>
            </button>
            <div className="ml-sm w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30">
              <img alt="Member Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS2kBOs5JPWDpStNpjBE7AxpR2N-zd6CvH0Y1_ekCQJD34a7om9L2rZkM4TAx_vu-3SGPtzRupXGO-UdPWHv0FGnscXUHcOgXeX38ucF1Y00nCa9helelEFLhaof7W1fpSssd0DpSgJu3Nyc-jYKL1o6suiivnw_nPO-ryttD6to9n082B-Ntu2oGJkCAuAL1VuYZk2rWIaAGwZozCbzAw368P-H_yMotufOmoUcFaUj_WZyuVqU1l" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
