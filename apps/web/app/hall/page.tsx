'use client';

import { MobileNavigation } from '@/components/ui/mobile-navigation';
import { HallBlueprint } from './components/hall-blueprint';
import { halls } from './lib/data';

export default function Hall() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {halls.map((hall) => (
        <HallBlueprint
          key={hall.id}
          hall={hall}
          detailHref={`/hall/${hall.id}`}
        />
      ))}
      <div className="mt-auto sticky bottom-0 left-0 right-0 w-full px-4 pb-4 max-w-md mx-auto">
        <MobileNavigation />
      </div>
    </div>
  );
}
