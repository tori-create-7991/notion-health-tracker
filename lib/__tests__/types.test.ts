import { describe, it, expect } from 'vitest';
import {
  DEFAULT_CONDITION_COLORS,
  CONDITION_LABELS,
  CONDITION_EMOJIS,
  DEFAULT_SETTINGS,
  UNRECORDED_COLOR,
} from '../types';

describe('types', () => {
  describe('DEFAULT_CONDITION_COLORS', () => {
    it('should have all 5 levels defined', () => {
      expect(DEFAULT_CONDITION_COLORS.level1).toBeDefined();
      expect(DEFAULT_CONDITION_COLORS.level2).toBeDefined();
      expect(DEFAULT_CONDITION_COLORS.level3).toBeDefined();
      expect(DEFAULT_CONDITION_COLORS.level4).toBeDefined();
      expect(DEFAULT_CONDITION_COLORS.level5).toBeDefined();
    });

    it('should have valid hex color format', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(DEFAULT_CONDITION_COLORS.level1).toMatch(hexColorRegex);
      expect(DEFAULT_CONDITION_COLORS.level2).toMatch(hexColorRegex);
      expect(DEFAULT_CONDITION_COLORS.level3).toMatch(hexColorRegex);
      expect(DEFAULT_CONDITION_COLORS.level4).toMatch(hexColorRegex);
      expect(DEFAULT_CONDITION_COLORS.level5).toMatch(hexColorRegex);
    });
  });

  describe('CONDITION_LABELS', () => {
    it('should have Japanese labels for all levels', () => {
      expect(CONDITION_LABELS[1]).toBe('とても悪い');
      expect(CONDITION_LABELS[2]).toBe('悪い');
      expect(CONDITION_LABELS[3]).toBe('普通');
      expect(CONDITION_LABELS[4]).toBe('良い');
      expect(CONDITION_LABELS[5]).toBe('とても良い');
    });
  });

  describe('CONDITION_EMOJIS', () => {
    it('should have emojis for all levels', () => {
      expect(CONDITION_EMOJIS[1]).toBe('😢');
      expect(CONDITION_EMOJIS[2]).toBe('😔');
      expect(CONDITION_EMOJIS[3]).toBe('😐');
      expect(CONDITION_EMOJIS[4]).toBe('🙂');
      expect(CONDITION_EMOJIS[5]).toBe('😊');
    });
  });

  describe('DEFAULT_SETTINGS', () => {
    it('should have empty Notion credentials', () => {
      expect(DEFAULT_SETTINGS.notionApiKey).toBe('');
      expect(DEFAULT_SETTINGS.notionDatabaseId).toBe('');
    });

    it('should have default condition colors', () => {
      expect(DEFAULT_SETTINGS.conditionColors).toEqual(DEFAULT_CONDITION_COLORS);
    });
  });

  describe('UNRECORDED_COLOR', () => {
    it('should be a valid hex color', () => {
      expect(UNRECORDED_COLOR).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
