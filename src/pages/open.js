import React, { useRef, useState, useEffect, useCallback } from "react";
import Layout from "@theme/Layout";
import Translate from "@docusaurus/Translate";
import {
  Chart,
  LineElement,
  LineController,
  LinearScale,
  PointElement,
  CategoryScale,
} from "chart.js";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import styles from "./styles.module.css";
import { translate } from "@docusaurus/Translate";

Chart.register(
  LineElement,
  LineController,
  LinearScale,
  CategoryScale,
  PointElement
);

async function getUsage() {
  const response = await fetch("https://open.gladysassistant.workers.dev/");
  const data = await response.json();
  const labels = [];
  const points = [];

  data.gladys_4_instances.forEach((elem, index) => {
    if (index < data.gladys_4_instances.length - 1) {
      labels.push(elem.month);
      points.push(elem.nb_instances);
    }
  });

  const forumPageViewsLabels = [];
  const forumPageViewsPoints = [];

  data.forum_page_views.forEach((elem) => {
    forumPageViewsLabels.push(elem.x);
    forumPageViewsPoints.push(elem.y);
  });

  let totalForumUser = 0;

  data.forum_users.forEach((user) => {
    totalForumUser += user.count;
  });

  data.forum_users.unshift({
    user_type: "total",
    count: totalForumUser,
  });

  return {
    labels,
    points,
    forumPageViewsLabels,
    forumPageViewsPoints,
    forum_users: data.forum_users,
    nb_gladys_plus_users: data.nb_gladys_plus_users,
    chartmogul_data: data.chartmogul_data,
  };
}

function Open() {
  const context = useDocusaurusContext();
  const [usageChartCanva, setUsageChartCanva] = useState(null);
  const [forumPageViewsCanva, setForumPageViewsCanva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usageChartData, setUsageChartData] = useState(null);
  const { i18n } = context;
  const language = i18n.currentLocale;
  const urlPrefix = language === "fr" ? "/fr" : "";

  const numberOfInstances = usageChartData
    ? usageChartData.points[usageChartData.points.length - 1]
    : null;

  const numberOfGladysPlusUsers = usageChartData
    ? usageChartData.nb_gladys_plus_users
    : null;

  const mrr = usageChartData
    ? Math.round(usageChartData.chartmogul_data.current / 100)
    : null;

  async function fetchData() {
    const data = await getUsage();
    setUsageChartData(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!usageChartData) {
      return;
    }
    const config = {
      type: "line",
      data: {
        labels: usageChartData.labels,
        datasets: [
          {
            label: "Number of Gladys instances",
            borderColor: "#74b9ff",
            data: usageChartData.points,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          tooltip: {
            position: "nearest",
          },
        },
        indexAxis: "x",
        scales: {
          x: {
            display: true,
          },
          y: {
            title: {
              display: true,
              text: "Number of instances",
            },
            beginAtZero: true,
          },
        },
      },
    };
    const forumPageViewsConfig = {
      type: "line",
      data: {
        labels: usageChartData.forumPageViewsLabels,
        datasets: [
          {
            label: "Forum pageviews",
            borderColor: "#74b9ff",
            data: usageChartData.forumPageViewsPoints,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: false,
          text: "Forum pageviews",
        },
        indexAxis: "x",
        scales: {
          x: {
            display: false,
          },
          y: {
            beginAtZero: false,
          },
        },
      },
    };
    if (usageChartCanva) {
      const usageCtx = usageChartCanva.getContext("2d");
      const usageChart = new Chart(usageCtx, config);
    }

    if (forumPageViewsCanva) {
      const forumPageViewsCtx = forumPageViewsCanva.getContext("2d");
      const forumPageViewsChart = new Chart(
        forumPageViewsCtx,
        forumPageViewsConfig
      );
    }
  }, [usageChartCanva, forumPageViewsCanva, usageChartData]);

  const usageChartRef = useCallback((node) => {
    setUsageChartCanva(node);
  }, []);

  const forumChartRef = useCallback((node) => {
    setForumPageViewsCanva(node);
  }, []);

  return (
    <Layout
      title={translate({
        id: "openPage.title",
        description: "",
        message: "Open Metrics",
      })}
      description={translate({
        id: "openPage.metaDescription",
        description: "gladys open page meta description",
        message: "See some interesting statistics about Gladys usage !",
      })}
    >
      <main>
        <div style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <h1
                  className="text--center"
                  style={{
                    fontSize: "50px",
                  }}
                >
                  <Translate
                    id="openPage.title"
                    description="Gladys open page title"
                  >
                    Open metrics
                  </Translate>
                </h1>
                <p className="text--center">
                  <Translate
                    id="openPage.description"
                    description="Open page description"
                  >
                    Gladys Assistant is completely transparent: how much people
                    are using Gladys? What's the current revenue of the project?
                  </Translate>
                </p>
              </div>
            </div>
            {loading && <div class={styles.spinner}></div>}
            {loading === false && (
              <div>
                <div className="row">
                  <div className={"col col--4 " + styles.openPageCard}>
                    <div className="card">
                      <div className="card__body">
                        <div className="text--center">
                          <Translate
                            id="openPage.homeRunningGladys"
                            description="Open Page home running Gladys"
                          >
                            Home running Gladys
                          </Translate>
                        </div>
                        <h3
                          className="text--center"
                          style={{ fontSize: "4rem" }}
                        >
                          {numberOfInstances}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className={"col col--4 " + styles.openPageCard}>
                    <div className="card">
                      <div className="card__body">
                        <div className="text--center">
                          <Translate
                            id="openPage.gladysPlusUsers"
                            description="Open Page gladys plus users Gladys"
                          >
                            Gladys Plus users
                          </Translate>
                        </div>
                        <h3
                          className="text--center"
                          style={{ fontSize: "4rem" }}
                        >
                          {numberOfGladysPlusUsers}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className={"col col--4 " + styles.openPageCard}>
                    <div className="card">
                      <div className="card__body">
                        <div className="text--center">
                          <Translate
                            id="openPage.mrr"
                            description="Open Page MRR"
                          >
                            MRR
                          </Translate>
                        </div>
                        <h3
                          className="text--center"
                          style={{ fontSize: "4rem" }}
                        >
                          {mrr} €
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div class={"row " + styles.openPageChartRow}>
                  <div className={"col col--12 " + styles.openPageCard}>
                    <div className="card">
                      <div className="card__body">
                        <h2 className="text--center">
                          <Translate
                            id="openPage.numberOfHomeRunningGladys"
                            description="Chart title"
                          >
                            Number of home running Gladys
                          </Translate>
                        </h2>
                        <div style={{ height: "400px" }}>
                          <canvas ref={usageChartRef}></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class={"row " + styles.openPageChartRow}>
                  <div className={"col col--4 " + styles.openPageCard}>
                    <div className="card" style={{ height: "270px" }}>
                      <div className="card__body">
                        <h2 className="text--center">
                          <Translate
                            id="openPage.lastYearReviews"
                            description="Last year reviews"
                          >
                            Last years reviews
                          </Translate>
                        </h2>
                        <ul>
                          <li className={styles.openPageList}>
                            <a href={`${urlPrefix}/blog/2024-year-in-review`}>
                              <Translate
                                id="openPage.yearlyReview"
                                description="Yearly reviews"
                                values={{ year: 2024 }}
                              >
                                {"{year} yearly review"}
                              </Translate>
                            </a>
                          </li>
                          <li className={styles.openPageList}>
                            <a href={`${urlPrefix}/blog/2023-year-in-review`}>
                              <Translate
                                id="openPage.yearlyReview"
                                description="Yearly reviews"
                                values={{ year: 2023 }}
                              >
                                {"{year} yearly review"}
                              </Translate>
                            </a>
                          </li>
                          <li className={styles.openPageList}>
                            <a href={`${urlPrefix}/blog/2022-year-in-review`}>
                              <Translate
                                id="openPage.yearlyReview"
                                description="Yearly reviews"
                                values={{ year: 2022 }}
                              >
                                {"{year} yearly review"}
                              </Translate>
                            </a>
                          </li>
                          <li className={styles.openPageList}>
                            <a href={`${urlPrefix}/blog/2021-year-in-review`}>
                              <Translate
                                id="openPage.yearlyReview"
                                description="Yearly reviews"
                                values={{ year: 2021 }}
                              >
                                {"{year} yearly review"}
                              </Translate>
                            </a>
                          </li>
                          <li className={styles.openPageList}>
                            <a
                              href={`${urlPrefix}/blog/bilan-2020-gladys-assistant`}
                            >
                              <Translate
                                id="openPage.yearlyReview"
                                description="Yearly reviews"
                                values={{ year: 2020 }}
                              >
                                {"{year} yearly review"}
                              </Translate>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className={"col col--4 " + styles.openPageCard}>
                    <div className="card" style={{ height: "270px" }}>
                      <div className="card__body">
                        <h2 className="text--center">
                          <Translate
                            id="openPage.nbOfForumUsers"
                            description="Gladys open page number of forum users"
                          >
                            No. of forum users
                          </Translate>
                        </h2>
                        <ul>
                          {usageChartData &&
                            usageChartData.forum_users &&
                            usageChartData.forum_users.map((user) => (
                              <li className={styles.openPageList}>
                                <b>{user.user_type}:</b> {user.count}
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className={"col col--4 " + styles.openPageCard}>
                    <div className="card" style={{ height: "270px" }}>
                      <div className="card__header">
                        <h2
                          className="text--center"
                          style={{ marginBottom: 0 }}
                        >
                          <Translate
                            id="openPage.forumPageViews"
                            description="Gladys open forum page views"
                          >
                            Forum page views
                          </Translate>
                        </h2>
                        <div className="text--center">
                          <Translate
                            id="openPage.lastWeek"
                            description="Gladys Open page last week"
                          >
                            (Last week)
                          </Translate>
                        </div>
                      </div>
                      <div className="card__body">
                        <div
                          style={{
                            height: "150px",
                            width: "100%",
                          }}
                        >
                          <canvas ref={forumChartRef}></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Open;
