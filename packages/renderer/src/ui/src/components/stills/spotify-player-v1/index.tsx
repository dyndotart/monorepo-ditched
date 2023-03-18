import React from 'react';
import BackSvg from './components/BackSvg';
import HeartSvg from './components/HeartSvg';
import PlaySvg from './components/PlaySvg';
import RepeatSvg from './components/RepeatSvg';
import ShuffleSvg from './components/ShuffleSvg';
import SkipSvg from './components/SkipSvg';
import SpotifyCode from './components/SpotifyCode';
import { THEMES, TTheme } from './core';
import { formatDuration, getSliderBackgroundSize } from './service';
import './styles.css';

const SpotifyPlayerV1: React.FC<TProps> = (props) => {
  const { title, subtitle, time, spotifyCode, trackId, imageUrl } = props;
  const theme: TTheme =
    typeof props.theme === 'string' ? THEMES[props.theme] : props.theme;

  if (theme == null) {
    return <p className={'text-white'}>Failed to load Theme {theme}</p>;
  }

  return (
    <div
      className={'h-full w-full p-16'}
      style={{ background: theme.background }}
    >
      <img src={imageUrl} className={'object-cover w-[467px] h-[467px]'} />

      {/* Content */}
      <div className={'mt-6'}>
        {/* Title Playing */}
        <div className={'flex flex-row items-center justify-between'}>
          <div>
            <p
              className={'font-[Montserrat] text-[28px] font-bold'}
              style={{ color: theme.text }}
            >
              {title}
            </p>
            <p
              className={'font-[Montserrat] text-base font-normal'}
              style={{ color: theme.textSecondary }}
            >
              {subtitle}
            </p>
          </div>
          <HeartSvg color={theme.primary} />
        </div>

        {/* Player Timeline */}
        <div className={'mt-2 w-full'}>
          <input
            type="range"
            min={0}
            max={time.total}
            value={time.current}
            className={'slider'}
            style={{
              //  ...sliderStyles,
              ...getSliderBackgroundSize(time.current, time.total),
            }}
          />
          <div className={'flex w-full items-center justify-between'}>
            <span
              className={'font-[Montserrat] text-sm font-bold'}
              style={{ color: theme.textSecondary }}
            >
              {formatDuration(time.current)}
            </span>
            <span
              className={'font-[Montserrat] text-sm font-bold'}
              style={{ color: theme.textSecondary }}
            >
              {formatDuration(time.total)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div
          className={'mt-4 flex w-full flex-row items-center justify-between'}
        >
          <ShuffleSvg color={theme.text} />
          <div className={'flex flex-row items-center'}>
            <SkipSvg />
            <PlaySvg className={'mx-8'} />
            <BackSvg />
          </div>
          <RepeatSvg color={theme.primary} />
        </div>

        {/* Spotify Code */}
        {spotifyCode && (
          <div className={'mt-4 flex w-full items-center justify-center'}>
            <SpotifyCode
              backgroundColor={theme.background}
              color={theme.text}
              trackId={trackId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyPlayerV1;

type TProps = {
  title: string;
  subtitle: string;
  time: {
    total: number;
    current: number;
  };
  spotifyCode: boolean;
  trackId: string;
  imageUrl: string;
  theme: TTheme | keyof typeof THEMES;
};

const sliderStyles: React.CSSProperties = {
  appearance: 'none',
  width: '100%',
  height: '1px',
  backgroundColor: '#424141',
  outline: 'none',
  borderRadius: 'lg',
  backgroundImage: 'linear-gradient(white, white)',
  backgroundRepeat: 'no-repeat',
};

const sliderThumbStyles: React.CSSProperties = {
  appearance: 'none',
  width: '3px',
  height: '3px',
  borderRadius: 'full',
  backgroundColor: 'white',
};
