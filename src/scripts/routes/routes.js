import { HomePresenter } from '../presenters/HomePresenter';
import { HomeView } from '../views/HomeView';
import { HomeModel } from '../models/HomeModel';
import { LoginPresenter } from '../presenters/LoginPresenter';
import { LoginView } from '../views/LoginView';
import { LoginModel } from '../models/LoginModel';
import { RegisterPresenter } from '../presenters/RegisterPresenter';
import { RegisterView } from '../views/RegisterView';
import { RegisterModel } from '../models/RegisterModel';
import { AddGuestStoryPresenter } from '../presenters/AddGuestStoryPresenter';
import { AddGuestStoryView } from '../views/AddGuestStoryView';
import { AddGuestStoryModel } from '../models/AddGuestStoryModel';
import { AddStoryPresenter } from '../presenters/AddStoryPresenter';
import { AddStoryView } from '../views/AddStoryView';
import { AddStoryModel } from '../models/AddStoryModel';
import { StoryDetailPresenter } from '../presenters/StoryDetailPresenter';
import { StoryDetailView } from '../views/StoryDetailView';
import { StoryDetailModel } from '../models/StoryDetailModel';
import { FavoritesPresenter } from '../presenters/FavoritesPresenter';
import { FavoritesView } from '../views/FavoritesView';
import NotificationsPresenter from '../presenters/NotificationsPresenter';
import NotificationsView from '../views/NotificationsView';

const routes = {
  '/': {
    presenter: HomePresenter,
    view: HomeView,
    model: HomeModel,
  },
  '/login': {
    presenter: LoginPresenter,
    view: LoginView,
    model: LoginModel,
  },
  '/register': {
    presenter: RegisterPresenter,
    view: RegisterView,
    model: RegisterModel,
  },
  '/add-story': {
    presenter: AddStoryPresenter,
    view: AddStoryView,
    model: AddStoryModel,
  },
  '/add-guest-story': {
    presenter: AddGuestStoryPresenter,
    view: AddGuestStoryView,
    model: AddGuestStoryModel,
  },
  '/story/:id': {
    presenter: StoryDetailPresenter,
    view: StoryDetailView,
    model: StoryDetailModel,
  },
  '/favorites': {
    presenter: FavoritesPresenter,
    view: FavoritesView,
  },
  '/notifications': {
    presenter: NotificationsPresenter,
    view: NotificationsView,
  },
};

export default routes;
