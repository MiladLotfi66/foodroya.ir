// components/AvatarGroupTailwind.js
'use client';

import Image from 'next/image';
import PropTypes from 'prop-types';

const AvatarGroupTailwind = ({ avatars, max = 4, size = 40, overlap = 10 }) => {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  // تبدیل اندازه و همپوشانی به پیکسل
  const avatarSize = size; // اندازه به پیکسل
  const overlapPx = overlap;

  return (
    <div className="flex items-center justify-center" style={{ height: avatarSize }}>
      {displayAvatars.map((avatar, index) => (
        <div
          key={index}
          className="relative rounded-full overflow-hidden border-2 border-white"
          style={{
            width: avatarSize,
            height: avatarSize,
            marginInlineStart: index !== 0 ? `-${overlapPx}px` : '0px', // استفاده از margin-inline-start بجای margin-left
            zIndex: displayAvatars.length - index, // آواتارهای بعدی بالاتر نمایش داده شوند
          }}
        >
          <Image
            src={avatar}
            alt={`User avatar ${index + 1}`}
            layout="fill"
            objectFit="cover"
            className="rounded-full"
          />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="flex items-center justify-center rounded-full border-2 border-white bg-gray-300 text-gray-700 text-sm font-medium"
          style={{
            width: avatarSize,
            height: avatarSize,
            marginLeft: `-${overlapPx}px`,
            zIndex: displayAvatars.length + 1, // آواتارهای اضافه بالاتر قرار گیرند
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

AvatarGroupTailwind.propTypes = {
  avatars: PropTypes.arrayOf(PropTypes.string).isRequired,
  max: PropTypes.number,
  size: PropTypes.number,
  overlap: PropTypes.number,
};

export default AvatarGroupTailwind;
