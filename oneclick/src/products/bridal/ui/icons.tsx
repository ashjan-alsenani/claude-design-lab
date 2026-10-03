"use client";

import {
  AirplaneTiltIcon,
  BuildingsIcon,
  CakeIcon,
  CameraIcon,
  ChampagneIcon,
  ClipboardTextIcon,
  CoatHangerIcon,
  DiamondIcon,
  DressIcon,
  EnvelopeIcon,
  FlowerIcon,
  FlowerLotusIcon,
  ForkKnifeIcon,
  GiftIcon,
  HairDryerIcon,
  HandPalmIcon,
  HandshakeIcon,
  HighHeelIcon,
  HouseIcon,
  MusicNotesIcon,
  ScrollIcon,
  ShoppingBagIcon,
  SparkleIcon,
  UserIcon,
  UsersThreeIcon,
  CalendarHeartIcon,
  HeartIcon,
  type Icon,
} from "@phosphor-icons/react";
import type { CategoryKey, VendorCat } from "../model/types";

export const catIcon: Record<CategoryKey, Icon> = {
  planning: ClipboardTextIcon,
  venue: BuildingsIcon,
  planner: HandshakeIcon,
  photo: CameraIcon,
  dress: DressIcon,
  look: SparkleIcon,
  beauty: FlowerIcon,
  jewellery: DiamondIcon,
  accessories: HighHeelIcon,
  trousseau: ShoppingBagIcon,
  groom: UserIcon,
  invitations: EnvelopeIcon,
  guests: UsersThreeIcon,
  catering: ForkKnifeIcon,
  decor: FlowerLotusIcon,
  entertainment: MusicNotesIcon,
  henna: HandPalmIcon,
  milka: ScrollIcon,
  shower: GiftIcon,
  engagement: HeartIcon,
  home: HouseIcon,
  honeymoon: AirplaneTiltIcon,
  weddingday: CalendarHeartIcon,
  after: ChampagneIcon,
};

export const vendorIcon: Record<VendorCat, Icon> = {
  venue: BuildingsIcon,
  photo: CameraIcon,
  video: CameraIcon,
  makeup: SparkleIcon,
  hair: HairDryerIcon,
  dress: DressIcon,
  flowers: FlowerIcon,
  decor: FlowerLotusIcon,
  catering: ForkKnifeIcon,
  cake: CakeIcon,
  entertainment: MusicNotesIcon,
  henna: HandPalmIcon,
  transport: AirplaneTiltIcon,
  planner: HandshakeIcon,
  other: CoatHangerIcon,
};

export function CatIcon({ cat, size = 18 }: { cat: CategoryKey; size?: number }) {
  const I = catIcon[cat];
  return <I size={size} weight="regular" />;
}
