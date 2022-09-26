<template>
  <div class="fertilizer container">
    <div class="card">
      <div class="card-body">
        <div class="fertilizer-head fcsb-container">
          <h3 class="title weight-bold">Launchpad</h3>
          <div class="information fcsb-container">

            <div class="action-btn-group fcs-container">
              <div
                class="action-btn fcc-container icon-cursor"
                :class="activeSpinning ? 'active' : ''"
                @click="reloadTimer"
              >
                <img src="@/assets/icons/reload.svg" />
              </div>
              <a href="#faq" class="action-btn fcc-container icon-cursor">
                <span class="font-medium weight-semi spacing-small">FAQ</span>
              </a>
            </div>
          </div>
        </div>

        <div class="fertilizer-option-bar fcsb-container">
          <TabMenu
            :tabList="[
              { key: 'Upcoming', name: 'Upcoming Projects', short_name: 'Upcoming' },
              { key: 'FCFS', name: 'First Come First Served', short_name: 'FCFS' },
              { key: 'Funded', name: 'Funded Projects', short_name: 'Funded' }
            ]"
            fontSize="font-large"
            @onChange="changeTab"
          ></TabMenu>

          <div class="option-filter-group">
            <div class="option-filter option-filter-fixed fcc-container icon-cursor">
              <img
                src="@/assets/icons/search.svg"
                @click="
                  () => {
                    this.showSearchMenu = !this.showSearchMenu
                  }
                "
              />
            </div>

            <div
              v-if="showSearchMenu"
              class="option-search-collapse"
              v-click-outside="
                () => {
                  this.showSearchMenu = false
                }
              "
            >
              <div class="collapse-item-header fcsb-container">
                <label class="font-large weight-bold">Search</label>
                <img
                  class="icon-cursor"
                  src="@/assets/icons/close-circle.svg"
                  @click="
                    () => {
                      this.showSearchMenu = false
                    }
                  "
                />
              </div>
              <div class="collapse-item-body">
                <input ref="userInput" v-model="searchName" class="font-medium" placeholder="Search" />
              </div>
            </div>

            <div
              class="option-filter option-sort fcc-container icon-cursor"
              @click="
                () => {
                  this.showFilterMenu = !this.showFilterMenu
                }
              "
            >
              <span class="option-sort-item fcc-container font-body-medium weight-semi">
                <label>Sort by:</label>
                <span class="sort-detail">
                  <span v-if="filterProject === filterOptions.upcoming">
                    {{
                      sortUpcoming === filterOptions.all
                        ? filterOptions.all
                        : sortUpcoming === filterOptions.whitelist
                        ? filterOptions.whitelist
                        : sortUpcoming === filterOptions.sales
                        ? filterOptions.sales
                        : sortUpcoming === filterOptions.distribution
                        ? filterOptions.distribution
                        : sortUpcoming === filterOptions.preparation
                        ? filterOptions.preparation
                        : filterOptions.all
                    }}
                  </span>
                  <span v-else>
                    {{
                      sortFunded === sortOptions.investors
                        ? sortOptions.investors + (sortAsc ? ' (High > Low)' : ' (Low > High)')
                        : sortFunded === sortOptions.total_raised
                        ? sortOptions.total_raised + (sortAsc ? ' (High > Low)' : ' (Low > High)')
                        : sortFunded === sortOptions.token_price
                        ? sortOptions.token_price + (sortAsc ? ' (High > Low)' : ' (Low > High)')
                        : sortFunded === sortOptions.ath
                        ? sortOptions.ath + (sortAsc ? ' (High > Low)' : ' (Low > High)')
                        : sortFunded === sortOptions.end_date
                        ? sortOptions.end_date + (sortAsc ? ' (High > Low)' : ' (Low > High)')
                        : ''
                    }}
                  </span>
                  <img
                    class="arrow-icon"
                    :class="showFilterMenu ? 'arrow-up' : 'arrow-down'"
                    src="@/assets/icons/arrow-down-white.svg"
                  />
                </span>
              </span>
            </div>

            <div class="option-filter option-filter-collapse option-filter-fixed fcc-container icon-cursor">
              <img
                src="@/assets/icons/filter.svg"
                @click="
                  () => {
                    this.showFilterMenu = !this.showFilterMenu
                  }
                "
              />
            </div>

            <div
              v-if="showFilterMenu"
              v-click-outside="
                () => {
                  this.showFilterMenu = false
                }
              "
            >
              <div v-if="filterProject === filterOptions.upcoming" class="option-sort-collapse collapse-right">
                <div
                  class="collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortUpcoming === filterOptions.all ? 'active-item' : ''"
                  @click="sortByStatus(filterOptions.all)"
                >
                  {{ filterOptions.all }}
                </div>
                <div
                  class="collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortUpcoming === filterOptions.whitelist ? 'active-item' : ''"
                  @click="sortByStatus(filterOptions.whitelist)"
                >
                  {{ filterOptions.whitelist }}
                </div>
                <div
                  class="collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortUpcoming === filterOptions.sales ? 'active-item' : ''"
                  @click="sortByStatus(filterOptions.sales)"
                >
                  {{ filterOptions.sales }}
                </div>
                <div
                  class="collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortUpcoming === filterOptions.distribution ? 'active-item' : ''"
                  @click="sortByStatus(filterOptions.distribution)"
                >
                  {{ filterOptions.distribution }}
                </div>
                <div
                  class="collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortUpcoming === filterOptions.preparation ? 'active-item' : ''"
                  @click="sortByStatus(filterOptions.preparation)"
                >
                  {{ filterOptions.preparation }}
                </div>
              </div>
              <div v-else-if="filterProject === filterOptions.funded" class="option-sort-collapse collapse-right">
                <div
                  class="collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortFunded === sortOptions.investors && !sortAsc ? 'active-item' : ''"
                  @click="sortByColumnMenu(sortOptions.investors, false)"
                >
                  {{ sortOptions.investors }} (Low > High)
                </div>
                <div
                  class="collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortFunded === sortOptions.investors && sortAsc ? 'active-item' : ''"
                  @click="sortByColumnMenu(sortOptions.investors, true)"
                >
                  {{ sortOptions.investors }} (High > Low)
                </div>
                <div
                  class="collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortFunded === sortOptions.total_raised && !sortAsc ? 'active-item' : ''"
                  @click="sortByColumnMenu(sortOptions.total_raised, false)"
                >
                  {{ sortOptions.total_raised }} (Low > High)
                </div>
                <div
                  class="collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortFunded === sortOptions.total_raised && sortAsc ? 'active-item' : ''"
                  @click="sortByColumnMenu(sortOptions.total_raised, true)"
                >
                  {{ sortOptions.total_raised }} (High > Low)
                </div>
                <div
                  class="collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortFunded === sortOptions.ath && !sortAsc ? 'active-item' : ''"
                  @click="sortByColumnMenu(sortOptions.ath, false)"
                >
                  {{ sortOptions.ath }} (Low > High)
                </div>
                <div
                  class="collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortFunded === sortOptions.ath && sortAsc ? 'active-item' : ''"
                  @click="sortByColumnMenu(sortOptions.ath, true)"
                >
                  {{ sortOptions.ath }} (High > Low)
                </div>
              </div>


              <div v-else class="option-sort-collapse collapse-right">
                <div
                  class="collapse-item text-center texts weight-bold icon-cursor"
                  :class="sortUpcoming === filterOptions.all ? 'active-item' : ''"
                >
                  {{ filterOptions.all }}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="fertilizer-content">
          <Row v-if="filterProject === filterOptions.upcoming" :gutter="[18, 28]">
            <Col
              v-for="(fertilizer, idx) in fertilizerItems"
              :key="fertilizer.key"
              :lg="idx === 0 ? 12 : 6"
              :md="idx === 0 ? 16 : 8"
              :sm="24"
            >
              <div class="fertilizer-project-table" :class="idx === 0 ? 'first' : ''">
                <div class="project-banner">
                  <img
                    class="banner"
                    :src="idx === 0 || windowWidth <= 767 ? fertilizer.picture : fertilizer.picture_mobile"
                  />
                  <div
                    class="project-status"
                    :class="
                      fertilizer.status === filterOptions.upcoming
                        ? 'upcoming'
                        : fertilizer.status === filterOptions.whitelist
                        ? 'whitelist'
                        : fertilizer.status === filterOptions.sales
                        ? 'sales'
                        : fertilizer.status === filterOptions.distribution
                        ? 'distribution'
                        : fertilizer.status === filterOptions.preparation
                        ? 'preparation'
                        : ''
                    "
                  >
                    <span class="font-xsmall weight-bold">
                      {{
                        fertilizer.status === filterOptions.sales && currentTimestamp > fertilizer.sales_start_date
                          ? 'Open Sales'
                          : fertilizer.status
                      }}
                    </span>
                  </div>
                </div>

                <div class="project-details">
                  <div class="project-desc" :class="idx === 0 ? 'project-desc-whitelist fssb-container' : ''">
                    <div class="project-title">
                      <div class="fcs-container">
                        <h4 class="title weight-bold spacing-medium">{{ fertilizer.title }}</h4>
                        <a :href="fertilizer.twitter_link" target="_blank"
                          ><img class="twitter-icon" src="@/assets/icons/twitter-white.svg" alt="twitter link"
                        /></a>
                      </div>
                      <span class="short-desc font-medium weight-semi spacing-small">{{ fertilizer.short_desc }}</span>
                    </div>

                    <div class="project-info fcsb-container">
                      <div class="project-balance">
                        <span class="label font-small weight-semi spacing-large">Total raise</span>
                        <span class="value font-medium weight-semi spacing-small fcs-container">
                          <CoinIcon class="coin-icon" :mint-address="fertilizer.price_token_mint" />
                          {{ fertilizer.hard_cap.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}
                          {{ fertilizer.hard_cap == 'TBA' ? '' : fertilizer.price_token }}
                        </span>
                      </div>
                      <div class="project-balance">
                        <div v-if="fertilizer.subscribers > 0 && fertilizer.hard_cap != 'TBA'">
                          <span class="label font-small weight-semi spacing-large">Registered on</span>
                          <span class="value font-medium weight-semi spacing-small fcs-container">{{
                            fertilizer.subscribers
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div
                    v-if="idx === 0 && fertilizer.hard_cap == 'TBA'"
                    class="project-info fcs-container"
                  >
                  </div>

                  <div
                    v-if="idx === 0 && fertilizer.hard_cap != 'TBA'"
                    class="project-info whitelist-countdown fcc-container text-center"
                  >
                    <Countdown
                      v-if="fertilizer.distribution_start_date > currentTimestamp"
                      :title="
                        fertilizer.status === filterOptions.whitelist
                          ? 'The Whitelist ends in'
                          : fertilizer.status === filterOptions.sales && currentTimestamp < fertilizer.sales_start_date
                          ? 'Sales starts in'
                          : fertilizer.status === filterOptions.sales && currentTimestamp > fertilizer.sales_start_date
                          ? 'End of the sales in'
                          : fertilizer.status === filterOptions.distribution
                          ? 'Distribution starts in'
                          : fertilizer.status === filterOptions.preparation
                          ? 'Whitelist starts in'
                          : ''
                      "
                      :value="
                        fertilizer.status === filterOptions.whitelist
                          ? fertilizer.whitelist_end_date
                          : fertilizer.status === filterOptions.sales && currentTimestamp < fertilizer.sales_start_date
                          ? fertilizer.sales_start_date
                          : fertilizer.status === filterOptions.sales && currentTimestamp > fertilizer.sales_start_date
                          ? fertilizer.sales_end_date
                          : fertilizer.status === filterOptions.distribution
                          ? fertilizer.distribution_start_date
                          : fertilizer.status === filterOptions.preparation
                          ? fertilizer.whitelist_start_date
                          : ''
                      "
                      format="DD:HH:mm:ss"
                      @finish="flush()"
                    />
                  </div>

                  <div v-else-if="fertilizer.hard_cap != 'TBA'" class="project-info fcs-container">
                    <div
                      v-if="
                        fertilizer.sales_start_date ||
                        fertilizer.sales_end_date ||
                        fertilizer.distribution_start_date ||
                        fertilizer.distribution_end_date ||
                        fertilizer.whitelist_start_date ||
                        fertilizer.whitelist_end_date
                      "
                    >
                      <div
                        v-if="
                          fertilizer.status === filterOptions.sales && currentTimestamp > fertilizer.sales_start_date
                        "
                        class="project-status open"
                      >
                        <!-- <span class="font-xsmall weight-bold">Open Now</span> -->
                      </div>
                      <div v-else-if="fertilizer.distribution_start_date > currentTimestamp" class="project-balance">
                        <span class="label font-small weight-semi spacing-large">
                          {{
                            fertilizer.status === filterOptions.preparation
                              ? 'Whitelist starts in'
                              : fertilizer.status === filterOptions.whitelist
                              ? 'Whitelist ends in'
                              : fertilizer.status === filterOptions.sales
                              ? 'Sales starts in'
                              : fertilizer.status === filterOptions.distribution
                              ? 'Distribution starts in'
                              : ''
                          }}
                        </span>
                        <span class="value fcs-container" v-if="fertilizer.distribution_start_date > currentTimestamp">
                          <Countdown
                            :value="
                              fertilizer.status === filterOptions.preparation
                                ? fertilizer.whitelist_start_date
                                : fertilizer.status === filterOptions.whitelist
                                ? fertilizer.whitelist_end_date
                                : fertilizer.status === filterOptions.sales
                                ? fertilizer.sales_start_date
                                : fertilizer.status === filterOptions.distribution
                                ? fertilizer.distribution_start_date
                                : 0
                            "
                            format="DD:HH:mm:ss"
                            @finish="flush()"
                          />
                        </span>
                      </div>
                    </div>

                  </div>

                  <div v-else class="project-info fcs-container">
                    <div></div>
                  </div>

                  <div class="btn-container">
                    <Button
                      disabled
                      v-if="fertilizer.status === 'Upcoming' && fertilizer.hard_cap == 'TBA'"
                      class="btn-transparent font-medium weight-semi fcc-container spacing-small"
                      >Soon</Button
                    >
                    <Button
                      @click="goToProject(fertilizer)"
                      v-else-if="fertilizer.status === filterOptions.whitelist && !fertilizer.subscribed"
                      class="btn-transparent font-medium weight-semi fcc-container spacing-small"
                      >Subscription</Button
                    >
                    <Button
                      @click="goToProject(fertilizer)"
                      v-else-if="fertilizer.status === filterOptions.whitelist && fertilizer.subscribed"
                      class="btn-transparent font-medium weight-semi fcc-container spacing-small"
                      >More Details</Button
                    >
                    <Button
                      @click="goToProject(fertilizer)"
                      v-else
                      class="btn-transparent font-medium weight-semi fcc-container spacing-small"
                      >More Details</Button
                    >
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          <div v-else-if="filterProject === filterOptions.funded">
          
            <div class="fertilizer-funded-table isDesktop">
              <Row class="fertilizer-funded-table-header">
                <Col class="header-column font-small weight-bold text-left" span="6"> Project name </Col>
                <Col class="header-column font-small weight-bold" span="3">
                  <div class="header-column-title" @click="sortByColumn(sortOptions.investors)">
                    Investors
                    <img
                      v-if="sortFunded === sortOptions.investors"
                      src="@/assets/icons/arrow-down-green.svg"
                      class="arrow-icon"
                      :class="sortFunded === sortOptions.investors && sortAsc ? 'arrow-down' : 'arrow-up'"
                    />
                    <img
                      v-else
                      src="@/assets/icons/arrow-down-white.svg"
                      class="arrow-icon"
                      :class="sortFunded === sortOptions.investors && sortAsc ? 'arrow-down' : 'arrow-up'"
                    />
                  </div>
                </Col>
                <Col class="header-column font-small weight-bold" span="4">
                  <div class="header-column-title" @click="sortByColumn(sortOptions.total_raised)">
                    Total raise
                    <img
                      v-if="sortFunded === sortOptions.total_raised"
                      src="@/assets/icons/arrow-down-green.svg"
                      class="arrow-icon"
                      :class="sortFunded === sortOptions.total_raised && sortAsc ? 'arrow-down' : 'arrow-up'"
                    />
                    <img
                      v-else
                      src="@/assets/icons/arrow-down-white.svg"
                      class="arrow-icon"
                      :class="sortFunded === sortOptions.total_raised && sortAsc ? 'arrow-down' : 'arrow-up'"
                    />
                  </div>
                </Col>
                <Col class="header-column font-small weight-bold" span="3">
                  <div class="header-column-title" @click="sortByColumn(sortOptions.token_price)">
                    Token price
                    <img
                      v-if="sortFunded === sortOptions.token_price"
                      src="@/assets/icons/arrow-down-green.svg"
                      class="arrow-icon"
                      :class="sortFunded === sortOptions.token_price && sortAsc ? 'arrow-down' : 'arrow-up'"
                    />
                    <img
                      v-else
                      src="@/assets/icons/arrow-down-white.svg"
                      class="arrow-icon"
                      :class="sortFunded === sortOptions.token_price && sortAsc ? 'arrow-down' : 'arrow-up'"
                    />
                  </div>
                </Col>
                <Col class="header-column font-small weight-bold" span="3">
                  <div class="header-column-title" @click="sortByColumn(sortOptions.ath)">
                    ATH Since IDO
                    <img
                      v-if="sortFunded === sortOptions.ath"
                      src="@/assets/icons/arrow-down-green.svg"
                      class="arrow-icon"
                      :class="sortFunded === sortOptions.ath && sortAsc ? 'arrow-down' : 'arrow-up'"
                    />
                    <img
                      v-else
                      src="@/assets/icons/arrow-down-white.svg"
                      class="arrow-icon"
                      :class="sortFunded === sortOptions.ath && sortAsc ? 'arrow-down' : 'arrow-up'"
                    />
                  </div>
                </Col>
                <Col class="header-column font-small weight-bold" span="4">
                  <div class="header-column-title" @click="sortByColumn(sortOptions.end_date)">
                    Ended in UTC
                    <img
                      v-if="sortFunded === sortOptions.end_date"
                      src="@/assets/icons/arrow-down-green.svg"
                      class="arrow-icon"
                      :class="sortFunded === sortOptions.end_date && sortAsc ? 'arrow-down' : 'arrow-up'"
                    />
                    <img
                      v-else
                      src="@/assets/icons/arrow-down-white.svg"
                      class="arrow-icon"
                      :class="sortFunded === sortOptions.end_date && sortAsc ? 'arrow-down' : 'arrow-up'"
                    />
                  </div>
                </Col>
              </Row>

              <div class="fertilizer-funded-table-body">
                <Row
                  class="fertilizer-funded-table-item"
                  v-for="(fertilizer, idx) in fertilizerItems"
                  :key="fertilizer.key"
                >
                  <Col class="state" span="6">
                    <div class="project-name fcs-container">
                      <CoinIcon class="coin-icon logo" :mint-address="fertilizer.mint" />
                      <div class="title">
                        <span class="font-medium weight-semi">{{ fertilizer.title }}</span>
                        <span class="short-desc bodXS weight-semi">{{ fertilizer.short_desc }}</span>
                      </div>
                    </div>
                  </Col>

                  <Col class="state font-medium weight-semi" span="3">
                    {{ fertilizer.investors }}
                  </Col>

                  <Col class="state font-medium weight-semi" span="4">
                    <CoinIcon class="coin-icon fundedicon" :mint-address="fertilizer.price_token_mint" />
                    {{ new TokenAmount(fertilizer.hard_cap, 2, false).format() }}
                  </Col>
                  <Col class="state font-medium weight-semi" span="3">
                    <CoinIcon class="coin-icon fundedicon" :mint-address="fertilizer.price_token_mint" />
                    {{ new TokenAmount(fertilizer.token_price, 3, false).format() }}
                  </Col>
                  <Col class="state font-medium weight-semi" span="3">
                    <div class="project-ath fcc-container">
                      <Tooltip placement="bottomLeft">
                        <template slot="title">
                          <span class="font-small weight-semi"
                            >If you invested $100 you would have ${{ fertilizer.var100 }}
                          </span>
                        </template>
                        <div class="info-icon">
                          <img src="@/assets/icons/info.svg" />
                        </div>
                      </Tooltip>
                      <span class="value font-medium weight-semi spacing-small"
                        >+{{ Math.round(fertilizer.ath * 10) / 10 }}%</span
                      >
                    </div>
                  </Col>
                  <Col class="state font-medium weight-semi" span="4">
                    {{ fertilizer.dateend }}
                  </Col>
                  <Col class="state" span="1">
                    <div class="show-more icon-cursor" @click="showMore(idx)">
                      <img src="@/assets/icons/dot3.svg" />
                      <div
                        v-if="showMoreMenu[idx]"
                        class="option-sort-collapse collapse-right"
                        v-click-outside="hideMore"
                      >
                        <!-- <div class="collapse-item text-center font-medium weight-semi icon-cursor">
                          <a> Stake </a>
                        </div> -->

                        <div class="collapse-item text-center font-medium weight-semi icon-cursor">
                          <NuxtLink :to="fertilizer.projectLink"><a> See project </a></NuxtLink>
                        </div>

                        <div class="collapse-item text-center font-medium weight-semi icon-cursor">
                          <NuxtLink :to="fertilizer.swapLink"><a> Swap </a></NuxtLink>
                        </div>
                        <div
                          v-if="fertilizer.share_link != ''"
                          class="collapse-item text-center font-medium weight-semi icon-cursor"
                        >
                          <a class="social-link fcc-container" :href="fertilizer.share_link" target="_blank">
                            Share
                            <img class="social-icon" src="@/assets/icons/share.svg" />
                          </a>
                        </div>
                        <div
                          v-if="fertilizer.twitter_link != ''"
                          class="collapse-item text-center font-medium weight-semi icon-cursor"
                        >
                          <a class="social-link fcc-container" :href="fertilizer.twitter_link" target="_blank">
                            Twitter
                            <img class="social-icon" src="@/assets/icons/twitter-white.svg" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            <div class="fertilizer-funded-table isTablet">
              <Collapse v-model="showCollapse" accordion>
                <CollapsePanel
                  v-for="(fertilizer, idx) in fertilizerItems"
                  :key="fertilizer.key"
                  v-show="true"
                  :show-arrow="true"
                >
                  <Row slot="header" class="collapse-header">
                    <Col class="state" span="8">
                      <div class="project-name fcs-container">
                        <CoinIcon class="coin-icon logo" :mint-address="fertilizer.mint" />

                        <div class="title">
                          <span class="font-medium weight-semi">{{ fertilizer.title }}</span>
                          <span class="short-desc bodXS weight-semi">{{ fertilizer.short_desc }}</span>
                        </div>
                      </div>
                    </Col>

                    <Col class="state text-center" span="5">
                      <span class="label font-small weight-bold">Investors</span>
                      <span class="font-medium weight-semi">{{ fertilizer.investors }} </span>
                    </Col>

                    <Col class="state font-medium weight-semi text-center" span="5">
                      <span class="label font-small weight-bold">Total raise</span>
                      <CoinIcon class="coin-icon fundedicon" :mint-address="fertilizer.price_token_mint" />
                      {{ new TokenAmount(fertilizer.hard_cap, 2, false).format() }}
                    </Col>

                    <Col class="state font-medium weight-semi text-center" span="5">
                      <span class="label font-small weight-bold">Token price</span>
                      <CoinIcon class="coin-icon fundedicon" :mint-address="fertilizer.price_token_mint" />
                      {{ new TokenAmount(fertilizer.token_price, 3, false).format() }}
                    </Col>

                    <Button class="detail-btn font-small weight-semi">
                      <img
                        class="arrow-icon"
                        :class="idx != showCollapse ? 'arrow-up' : 'arrow-down'"
                        src="@/assets/icons/arrow-down-white.svg"
                      />
                    </Button>
                  </Row>

                  <Row class="collapse-row" :gutter="[18, 18]">
                    <Col :span="12">
                      <div class="fssb-container">
                        <div class="state">
                          <span class="label font-small weight-bold">ATH Since IDO</span>
                          <div class="project-ath fcc-container">
                            <Tooltip placement="bottomLeft">
                              <template slot="title">
                                <span class="font-small weight-semi"
                                  >If you invested $100 you would have ${{ fertilizer.var100 }}</span
                                >
                              </template>
                              <div class="info-icon">
                                <img src="@/assets/icons/info.svg" />
                              </div>
                            </Tooltip>
                            <span class="value font-medium weight-semi spacing-small"
                              >+{{ Math.round(fertilizer.ath * 10) / 10 }}%</span
                            >
                          </div>
                        </div>

                        <div class="state text-center" span="5">
                          <span class="label font-small weight-bold">Ended in UTC</span>
                          <span class="font-medium weight-semi">{{ fertilizer.dateend }}</span>
                        </div>
                      </div>
                    </Col>

                    <Col class="btn-group" :span="12">
                      <div class="fce-container">
                        <!-- <div class="btn-container">
                          <Button class="btn-primary font-small weight-bold"> Stake </Button>
                        </div> -->

                        <div class="btn-container">
                          <NuxtLink :to="fertilizer.projectLink"><a> See project </a></NuxtLink>
                        </div>

                        <div class="btn-container">
                          <NuxtLink :to="fertilizer.swapLink"
                            ><Button class="btn-primary font-small weight-bold"> Swap </Button></NuxtLink
                          >
                        </div>
                      </div>
                    </Col>

                    <Col class="btn-group" :span="24">
                      <div class="fcc-container">
                        <a
                          v-if="fertilizer.share_link != ''"
                          class="social-link fcc-container font-xsmall weight-semi icon-cursor"
                          :href="fertilizer.share_link"
                          target="_blank"
                        >
                          Share
                          <img class="social-icon" src="@/assets/icons/share.svg" />
                        </a>
                        <a
                          v-if="fertilizer.twitter_link != ''"
                          class="social-link fcc-container font-xsmall weight-semi icon-cursor"
                          :href="fertilizer.twitter_link"
                          target="_blank"
                        >
                          Twitter
                          <img class="social-icon" src="@/assets/icons/twitter-white.svg" />
                        </a>
                      </div>
                    </Col>
                  </Row>
                </CollapsePanel>
              </Collapse>
            </div>

            <div class="fertilizer-funded-table isMobile">
              <Collapse v-model="showCollapse" accordion>
                <CollapsePanel
                  v-for="(fertilizer, idx) in fertilizerItems"
                  :key="fertilizer.key"
                  v-show="true"
                  :show-arrow="true"
                >
                  <Row slot="header" class="collapse-header">
                    <Col class="state" span="23">
                      <div class="project-name fcs-container">
                        <CoinIcon class="coin-icon logo" :mint-address="fertilizer.mint" />
                        <div class="title">
                          <span class="font-medium weight-semi">{{ fertilizer.title }}</span>
                          <span class="short-desc bodXS weight-semi">{{ fertilizer.short_desc }}</span>
                        </div>
                      </div>
                    </Col>

                    <Button class="detail-btn font-small weight-semi">
                      <img
                        class="arrow-icon"
                        :class="idx != showCollapse ? 'arrow-up' : 'arrow-down'"
                        src="@/assets/icons/arrow-down-white.svg"
                      />
                    </Button>
                  </Row>

                  <Row class="collapse-row" :gutter="[18, 18]">
                    <Col :span="24">
                      <div class="fcsb-container">
                        <div class="state">
                          <span class="label font-small weight-bold">Total raise</span>
                          <span class="font-medium weight-semi"
                            ><CoinIcon class="coin-icon fundedicon" :mint-address="fertilizer.price_token_mint" />
                            {{ new TokenAmount(fertilizer.hard_cap, 2, false).format() }}</span
                          >
                        </div>

                        <div class="state">
                          <span class="label font-small weight-bold">Investors</span>
                          <span class="font-medium weight-semi">{{ fertilizer.investors }}</span>
                        </div>
                      </div>
                    </Col>

                    <Col :span="24">
                      <div class="fcsb-container">
                        <div class="state">
                          <span class="label font-small weight-bold">Token price</span>
                          <span class="font-medium weight-semi spacing-small"
                            ><CoinIcon class="coin-icon fundedicon" :mint-address="fertilizer.price_token_mint" />
                            {{ new TokenAmount(fertilizer.token_price, 3, false).format() }}</span
                          >
                        </div>

                        <div class="state">
                          <span class="label font-small weight-bold">ATH Since IDO</span>
                          <div class="project-ath fcc-container">
                            <Tooltip placement="bottomLeft">
                              <template slot="title">
                                <span class="font-small weight-semi"
                                  >If you invested $100 you would have ${{ fertilizer.var100 }}</span
                                >
                              </template>
                              <div class="info-icon">
                                <img src="@/assets/icons/info.svg" />
                              </div>
                            </Tooltip>
                            <span class="value font-medium weight-semi spacing-small"
                              >+{{ Math.round(fertilizer.ath * 10) / 10 }}%</span
                            >
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col :span="24">
                      <div class="fcsb-container">
                        <div class="state" span="5">
                          <span class="label font-small weight-bold">Ended in UTC</span>
                          <span class="font-medium weight-semi">{{ fertilizer.dateend }}</span>
                        </div>
                      </div>
                    </Col>

                    <Col class="btn-group" :span="24">
                      <div class="btn-group-item fcc-container">
                        <!-- <div class="btn-container">
                          <Button class="btn-primary font-small weight-bold"> Stake </Button>
                        </div> -->

                        <div class="btn-container">
                          <NuxtLink :to="fertilizer.projectLink"><a> See project </a></NuxtLink>
                        </div>

                        <div class="btn-container">
                          <NuxtLink :to="fertilizer.swapLink"
                            ><Button class="btn-primary font-small weight-bold"> Swap </Button></NuxtLink
                          >
                        </div>
                      </div>

                      <div class="btn-group-item fcc-container">
                        <a
                          v-if="fertilizer.share_link != ''"
                          class="social-link fcc-container font-xsmall weight-semi icon-cursor"
                          :href="fertilizer.share_link"
                          target="_blank"
                        >
                          Share
                          <img class="social-icon" src="@/assets/icons/share.svg" />
                        </a>
                        <a
                          v-if="fertilizer.twitter_link != ''"
                          class="social-link fcc-container font-xsmall weight-semi icon-cursor"
                          :href="fertilizer.twitter_link"
                          target="_blank"
                        >
                          Twitter
                          <img class="social-icon" src="@/assets/icons/twitter-white.svg" />
                        </a>
                      </div>
                    </Col>
                  </Row>
                </CollapsePanel>
              </Collapse>
            </div>
          </div>


          <Row v-else :gutter="[18, 28]">
            <Col
              v-for="(item, idx) in fcfsData"
              :key="item.key"
              :lg="idx === 0 ? 12 : 6"
              :md="idx === 0 ? 16 : 8"
              :sm="24"
            >
              <div class="fertilizer-project-table" :class="idx === 0 ? 'first' : ''">
                <div class="project-banner">
                  <img class="banner" :src="idx === 0 || windowWidth <= 767 ? item.picture : item.picture_mobile" />
                  <div class="project-label-container fs-container">
                    <div class="project-status fcfs">
                      <span class="font-xsmall weight-bold">FCFS</span>
                    </div>
                  </div>
                </div>

                <div class="project-details">
                  <div class="project-desc" :class="idx === 0 ? 'project-desc-whitelist fssb-container' : ''">
                    <div class="project-title">
                      <div class="fcs-container">
                        <h4 class="title weight-bold spacing-medium">{{ item.title }}</h4>
                        <a :href="item.twitter_link" target="_blank"
                          ><img class="twitter-icon" src="@/assets/icons/twitter-white.svg" alt="twitter link"
                        /></a>
                      </div>
                      <span class="short-desc font-medium weight-semi spacing-small">{{ item.short_desc }}</span>
                    </div>

                    <div class="project-info fcsb-container">
                      <div class="project-balance">
                        <span class="label font-small weight-semi spacing-large">Total raise</span>
                        <span class="value font-medium weight-semi spacing-small fcs-container">
                          <CoinIcon class="coin-icon" :mint-address="item.price_token_mint" />
                          {{ item.hard_cap.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}
                          {{ item.hard_cap == 'TBA' ? '' : item.price_token }}
                        </span>
                      </div>
                      <div class="project-balance round fcc-container" v-if="item.round2 && item.round2.token_price">
                        <div class="text-center">
                          <span class="font-small weight-semi spacing-large d-block">ROUND</span>
                          <span class="font-medium weight-bold">{{ item.round }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="fcfs-container text-center">
                    <span class="font-medium weight-bold" v-if="item.missing > 0">Only {{ item.missing.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }} tokens left</span>
                    <span class="font-medium weight-bold" v-else-if="item.fcfsPercent <= 0 ">Not started yet</span>
                    <span class="font-medium weight-bold" v-else>No token left</span>
                    <ProgressBar v-if="item.fcfsPercent > 0" :percent="item.fcfsPercent" content="Fullfilled"></ProgressBar>
                  </div>

                  <div
                    v-if="idx === 0 && item.hard_cap != 'TBA'"
                    class="project-info whitelist-countdown fcc-container text-center"
                    style="opacity: 0"
                  >
                    <Countdown
                      v-if="item.distribution_start_date > currentTimestamp"
                      :title="
                        item.status === filterOptions.whitelist
                          ? 'The Whitelist ends in'
                          : item.status === filterOptions.sales && currentTimestamp < item.sales_start_date
                          ? 'Sales starts in'
                          : item.status === filterOptions.sales && currentTimestamp > item.sales_start_date
                          ? 'End of the sales in'
                          : item.status === filterOptions.distribution
                          ? 'Distribution starts in'
                          : item.status === filterOptions.preparation
                          ? 'Whitelist starts in'
                          : ''
                      "
                      :value="
                        item.status === filterOptions.whitelist
                          ? item.whitelist_end_date
                          : item.status === filterOptions.sales && currentTimestamp < item.sales_start_date
                          ? item.sales_start_date
                          : item.status === filterOptions.sales && currentTimestamp > item.sales_start_date
                          ? item.sales_end_date
                          : item.status === filterOptions.distribution
                          ? item.distribution_start_date
                          : item.status === filterOptions.preparation
                          ? item.whitelist_start_date
                          : ''
                      "
                      format="DD:HH:mm:ss"
                      @finish="flush()"
                    />
                  </div>

                  <div v-else-if="item.hard_cap != 'TBA'" class="project-info fcs-container">
                    <div
                      v-if="
                        item.sales_start_date ||
                        item.sales_end_date ||
                        item.distribution_start_date ||
                        item.distribution_end_date ||
                        item.whitelist_start_date ||
                        item.whitelist_end_date
                      "
                    >
                      <div
                        v-if="item.status === filterOptions.sales && currentTimestamp > item.sales_start_date"
                        class="project-label-container"
                      >
                        <div class="project-status open">
                          <!-- <span class="font-xsmall weight-bold">Open Now</span> -->
                        </div>
                      </div>
                      <div v-else-if="item.distribution_start_date > currentTimestamp" class="project-balance">
                        <span class="label font-small weight-semi spacing-large">
                          {{
                            item.status === filterOptions.preparation
                              ? 'Whitelist starts in'
                              : item.status === filterOptions.whitelist
                              ? 'Whitelist ends in'
                              : item.status === filterOptions.sales
                              ? 'Sales starts in'
                              : item.status === filterOptions.distribution
                              ? 'Distribution starts in'
                              : ''
                          }}
                        </span>
                        <span class="value fcs-container" v-if="item.distribution_start_date > currentTimestamp">
                          <Countdown
                            :value="
                              item.status === filterOptions.preparation
                                ? item.whitelist_start_date
                                : item.status === filterOptions.whitelist
                                ? item.whitelist_end_date
                                : item.status === filterOptions.sales
                                ? item.sales_start_date
                                : item.status === filterOptions.distribution
                                ? item.distribution_start_date
                                : 0
                            "
                            format="DD:HH:mm:ss"
                            @finish="flush()"
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div v-else class="project-info fcs-container">
                    <div></div>
                  </div>

                  <div class="btn-container">
                    <Button
                      @click="goToProjectFCFS(item)"
                      class="btn-transparent font-medium weight-semi fcc-container spacing-small"
                      >More Details</Button
                    >
                  </div>
                </div>
              </div>
            </Col>
          </Row>


        </div>


        <div class="fertilizer-guide w-100 m-auto" id="faq">
          <div class="guide-ido">
            <label class="font-large weight-bold w-100 d-block text-center">How to participate in IDO Launchpad?</label>
            <div class="guide-ido-container d-flex">
              <div v-for="(item, idx) in guideData.ido" :key="idx" class="guide-ido-item">
                <div class="item-title fcs-container mb-8">
                  <span class="item-no font-medium weight-bold fcc-container mr-8">{{ idx + 1 }}</span>
                  <span class="font-medium weight-semi spacing-small">{{ item.title }}</span>
                </div>
                <div class="item-banner fcc-container mb-8">
                  <img :src="require(`@/assets/icons/${item.icon}.svg`)" alt="ido item banner" />
                </div>
                <span class="font-small">{{ item.content }}</span>
              </div>
            </div>
          </div>
          <div class="guide-faq">
            <h3 class="weight-bold w-100 d-block text-center">FAQ's</h3>
            <div class="guide-faq-container w-100">
              <Row :gutter="16">
                <Col :span="windowWidth > 767 ? 12 : 24">
                  <div v-for="(item, idx) in guideData.faq" :key="idx">
                    <div
                      v-if="idx % 2 === 0"
                      :class="`guide-faq-item fc-container icon-cursor ${showFAQ[idx] ? 'opened' : ''}`"
                      @click="clickFAQ(idx)"
                    >
                      <div class="fcsb-container w-100">
                        <span class="font-medium weight-bold">{{ item.title }}</span>
                        <img class="icon-cursor ml-8" src="@/assets/icons/arrow-down-white.svg" alt="arrow down icon" />
                      </div>
                      <div v-if="showFAQ[idx]" class="guide-faq-collapse-item">
                        <span class="font-small">{{ item.content }}</span>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col :span="windowWidth > 767 ? 12 : 24">
                  <div v-for="(item, idx) in guideData.faq" :key="idx">
                    <div
                      v-if="idx % 2 === 1"
                      :class="`guide-faq-item fc-container icon-cursor ${showFAQ[idx] ? 'opened' : ''}`"
                      @click="clickFAQ(idx)"
                    >
                      <div class="fcsb-container w-100">
                        <span class="font-medium weight-bold">{{ item.title }}</span>
                        <img class="icon-cursor ml-8" src="@/assets/icons/arrow-down-white.svg" alt="arrow down icon" />
                      </div>
                      <div v-if="showFAQ[idx]" class="guide-faq-collapse-item">
                        <span class="font-small">{{ item.content }}</span>
                      </div>
                    </div>
                  </div></Col
                >
              </Row>
            </div>
          </div>
        </div>

        <!-- <div v-if="initialized"></div>

        <div v-else class="fcc-container">
          <Spin :spinning="true">
            <Icon slot="indicator" type="loading" style="font-size: 24px" spin />
          </Spin>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import importIcon from '@/utils/import-icon'
import { Collapse, Row, Col, Pagination, Button, Statistic, Tooltip } from 'ant-design-vue'
import { get, cloneDeep } from 'lodash-es'
import { TokenAmount } from '@/utils/safe-math'
import { getUnixTs } from '@/utils'
import moment from 'moment'
import { TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token'
import { TOKENS, NATIVE_SOL, getTokenByMintAddress } from '@/utils/tokens'
import { setAnchorProvider, getLaunchpad, getProjectFormatted } from '@/utils/crp-launchpad'

import {
  setAnchorProvider as setAnchorProvider_round1,
  getProjectFormatted as getProjectFormatted_round1,
} from '@/utils/crp-ido-fcfs'

import {
  setAnchorProvider as setAnchorProvider_round2,
  getProjectFormatted as getProjectFormatted_round2,
} from '@/utils/crp-ido-fcfs-round2'

const Vco = require('v-click-outside')
Vue.use(Vco)
const CollapsePanel = Collapse.Panel
const Countdown = Statistic.Countdown

export default Vue.extend({
  components: {
    // Spin,
    // Icon,
    Collapse,
    CollapsePanel,
    Row,
    Col,
    Button,
    Countdown,
    Tooltip
  },
  data() {
    return {
      searchName: '',
      coinPicUrl: '',
      initialized: false as boolean,
      labelizedAmms: {} as any,
      currentPage: 1,
      coinName: '',
      mintAddress: '',
      poolLoaded: false,
      autoRefreshTime: 60 as number,
      countdown: 0,
      showCollapse: [] as any[],
      timer: null as any,
      loading: false as boolean,
      poolType: true as boolean,
      TVL: 0,
      spTOKENS: {} as any,
      activeSpinning: false as boolean,
      showTabMenu: false as boolean,
      showSearchMenu: false as boolean,
      showFilterMenu: false as boolean,
      showMoreMenu: [] as boolean[],
      currentShowMore: -1 as number,
      sortUpcoming: 'All' as string,
      sortFunded: 'Investors' as string,
      sortAsc: false as boolean,
      filterOptions: {
        all: 'All',
        whitelist: 'Whitelist Open',
        sales: 'Sales',
        open: 'Open Sales',
        distribution: 'Distribution',
        upcoming: 'Upcoming',
        preparation: 'Preparation',
        funded: 'Funded',
        fcfs: 'FCFS'
      },
      registerdList: {},
      sortOptions: {
        investors: 'Investors',
        total_raised: 'Total raise',
        token_price: 'Token price',
        ath: 'ATH Since IDO',
        end_date: 'Ended in UTC'
      },
      filterProject: 'Upcoming' as string,
      fertilizerItems: [] as any[],
      projects: [] as any,

      fcfsData: [] as any,
      fertilizerData: [] as any,
      currentTimestamp: 0,
      windowWidth: window.innerWidth as any,
      fcfsPercent: 70 as number,

      guideData: {
        ido: [
          {
            icon: 'how-register',
            title: 'Register for the Whitelist',
            content:
              'Register yourself by coming to the Project Fertilizer page once the Whitelist has opened. Use the Fertilizer page to research the project before it opens during the preparation phase.'
          },
          {
            icon: 'how-lottery',
            title: 'Lottery & Sale',
            content:
              "Once you're registered, you'll be able to either 1. Enter the lottery or 2. Receive your guaranteed allocation / lottery ticket entitlement if you stake in Cropper's 5 Staking Tiers. Once the lottery winners have been announced after the Whitelist closes, winners and those with allocation will be able to purchase during the Sale."
          },
          {
            icon: 'how-claim',
            title: 'Claim & Trade',
            content:
              "Once the sale has ended, those who purchased during the sale will be able to claim at the project's TGE and then swap and farm directly on Cropper."
          }
        ],
        faq: [
          {
            title: 'What is Fertilizer?',
            content:
              "Fertilizer is Cropper's IDO Launchpad. Cropper uses Fertilizer to help exciting new Solana projects raise funds by allowing a select amount of people to participate in Token Buying for new projects at pre-sale prices.\n\n If I have guaranteed allocation do I still need to register during the Whitelist? \n\n Yes, even if you have guaranteed IDO allocation from staking in tiers 3, 4 or 5 you must register during the whitelist period in order to be eligible for purchase during the sale period. This is because the IDO is built on a smart contract and joining each whitelist requires you to approve a transaction in your wallet."
          },
          {
            title: 'What if my country is not accepted by KYC?',
            content:
              "Unfortunately if you do not hold a valid government ID with one of the accepted countries for KYC, you will not be able to participate in the sale phase. You'd need to be verified under an eligible country."
          },
          {
            title: 'What are Cropper Staking Tiers and how do they connect to Fertilizer?',
            content:
              "Cropper's has 5 Staking Tiers that users can reach based on how much sCRP they stake on Cropper Staking. Each Tier has special Fertiilzer rewards and advantages. Tiers 1 and 2 provide additional lottery tickets, while Tiers 3, 4, and 5 provide guaranteed IDO allocation for each IDO on Cropper. The higher your tier, the greater your rewards."
          },
          {
            title: 'What is the Preparation phase?',
            content:
              'Preparation takes place from the private onboarding of a project to the opening of the whitelist. Cropper works with the project during this phase to help strengthen their launch. We encourage participants to use the resources made available during preparation; such as the project detail page, discovery AMA events, and more.'
          },
          {
            title: 'What is the Whitelist phase?',
            content:
              "The Whitelist phase is when everyone registers for the IDO. Once the Whitelist has opened, participants will be able to register themselves for the Whitelist. If you do not have reserved lottery tickets or guaranteed allocation from Cropper's 5 Staking Tiers, you can still earn lottery tickets by completing the event's social tasks."
          },
          {
            title: 'What is the Sale phase?',
            content:
              "The Sale phase is when those with winning lottery tickets or guaranteed allocation from Cropper's 5 Staking Tiers are able to purchase the tokens they've been allocated. However, though the tokens are purchased during the sale phase, they will not be claimable until the launching project's Token Generation Event (TGE). All dates are on the project page."
          },
          {
            title: 'What is the Distribution phase?',
            content:
              "The distribution phase is after the launching project's TGE, when the Tokens are “distributed” to those who participated in the sale and able to be claimed on the Fertilizer page. This is when the tokens you purchased will show in your wallet and be tradable on Cropper Swap."
          },
          {
            title: "What's the difference between a Vested IDO and a Fully Unlocked IDO?",
            content:
              'There are two main ways that projects distribute their tokens for IDO launchpads. \n\n 1) Fully Unlocked (most popular) - this is when 100% of the tokens that the user purchased during the sale phase is available to be claimed at the TGE. \n\n 2) Vested - A vested IDO means that distribution is spread out over a specified period. For example, if 50% was claimable at TGE, and then the remaining 25% the following 2 months after that.'
          },
          {
            title: 'What is Cropper SafetyVest for vested IDOs and how does it work?',
            content:
              "SafetyVest is how Cropper protects your original investment in a Vested IDO on Cropper's Fertilizer IDO Launchpad. \n\n Here's how: \n\n • If the project's Token Price is below Pre-Sale on any Vested Unlock Day within the Vesting Schedule, IDO Sale participants will be refunded their original investment by Cropper in USDC of equal value to the Pre-Sale price for that unlock. \n\n • If the project's Token Price is below the Pre-Sale value for 2 consecutive Vested Unlock Days (e.g. Month 2, Month 3), participants will be reimbursed their remaining investment amount in USDC by Cropper for all remaining Unlocks and the vesting schedule will be terminated."
          }
        ]
      },
      showFAQ: [] as boolean[],
      currentFAQ: -1 as number
    }
  },

  head: {
    title: 'Fertilizer | IDO Launchpad - Cropper',
    meta: [
      {
        hid: 'og:site_name',
        property: 'og:site_name',
        content: 'Cropper'
      },
      {
        hid: 'og:type',
        property: 'og:type',
        content: 'website'
      },
      {
        hid: 'og:url',
        property: 'og:url',
        content: 'https://cropper.finance/launchpad/'
      },
      {
        hid: 'og:title',
        property: 'og:title',
        content: 'Fertilizer | IDO Launchpad - Cropper'
      },
      {
        itemprop: 'name',
        content: 'Fertilizer | IDO Launchpad - Cropper'
      },
      {
        name: 'title',
        content: 'Fertilizer | IDO Launchpad - Cropper'
      },
      {
        hid: 'og:description',
        name: 'og:description',
        content: 'See upcoming whitelists. Join an IDO event. Discover new projects. See past ROIs of Fertilizer.'
      },
      {
        hid: 'description',
        itemprop: 'description',
        name: 'description',
        content: 'See upcoming whitelists. Join an IDO event. Discover new projects. See past ROIs of Fertilizer.'
      },
      {
        hid: 'twitter:card',
        name: 'twitter:card',
        content: 'summary'
      },
      {
        hid: 'twitter:card',
        name: 'twitter:card',
        content: 'https://cropper.finance/launchpad/'
      },
      {
        hid: 'twitter:title',
        name: 'twitter:title',
        content: 'Fertilizer | IDO Launchpad - Cropper'
      },
      {
        hid: 'twitter:description',
        name: 'twitter:description',
        content: 'See upcoming whitelists. Join an IDO event. Discover new projects. See past ROIs of Fertilizer.'
      },
      {
        hid: 'twitter:creator',
        name: 'twitter:creator',
        content: '@CropperFinance'
      }
    ],

    link: [
      {
        hid: 'canonical',
        rel: 'canonical',
        href: 'https://cropper.finance/launchpad/'
      }
    ]
  },

  computed: {
    ...mapState(['app', 'wallet', 'farm', 'url', 'price', 'liquidity'])
  },
  async mounted() {
    // this.$router.push({ path: `/swap/` })
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
    })

    setAnchorProvider(this.$web3, this.$wallet)
    setAnchorProvider_round1(this.$web3, this.$wallet)
    setAnchorProvider_round2(this.$web3, this.$wallet)
    await getLaunchpad()
    this.getTvl()
    this.$accessor.token.loadTokens()

    this.timer = setInterval(async () => {
      clearInterval(this.timer)
      this.setTimer()
    }, 1000)

    this.currentTimestamp = moment().valueOf()
    await this.constructFertilizerData()
    this.updateFertilizer()

    this.guideData.faq.forEach((element) => {
      this.showFAQ.push(false)
    })
  },

  watch: {
    showCollapse: {
      immediate: true,
      handler() {
        if (this.showCollapse.length > 0) {
          this.showCollapse.splice(0, this.showCollapse.length)
        }
      },
      deep: true
    },
    searchName: {
      handler(newSearchName: string) {
        this.filterFertilizer(newSearchName, this.filterProject)
      },
      deep: true
    },
    filterProject: {
      handler(newFilterProject: string) {
        this.sortUpcoming = this.filterOptions.all
        this.sortFunded = this.sortOptions.investors
        this.sortAsc = false
        this.showFilterMenu = false
        this.filterFertilizer(this.searchName, newFilterProject)
      },
      deep: true
    },

    'wallet.address': {
      handler(newTokenAccounts: any) {
        setAnchorProvider(this.$web3, this.$wallet)
        setAnchorProvider_round1(this.$web3, this.$wallet)
        setAnchorProvider_round2(this.$web3, this.$wallet)
        this.flush()
      },
      deep: true
    },
    'wallet.connected': {
      handler(connected: any) {
        setAnchorProvider(this.$web3, this.$wallet)
        setAnchorProvider_round1(this.$web3, this.$wallet)
        setAnchorProvider_round2(this.$web3, this.$wallet)
        this.flush()
      },
      deep: true
    }
  },
  methods: {
    importIcon,
    TokenAmount,

    async constructFertilizerData() {
      this.spTOKENS['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'] = { decimals: 6 }
      this.spTOKENS['11111111111111111111111111111111'] = { decimals: 9 }
      this.spTOKENS['So11111111111111111111111111111111111111112'] = { decimals: 9 }
      try {
        let registerdList
        try {
          registerdList = await fetch('https://flow.cropper.finance/registers/').then((res) => res.json())
        } catch {
        } finally {
        }

        let responseData
        try {
          responseData = await fetch('https://api.cropper.finance/fertilizer/').then((res) => res.json())
        } catch {
          // dummy data
        } finally {
        }

        this.fertilizerData = []
        let key = 0

        for (const item of responseData.message) {
          let project = {
            status: 'Whitelist Open',
            subscribed: false,
            key: 'k' + key,
            picture: item['picture'],
            picture_mobile: item['picture_mobile'],
            title: item['title'],
            short_desc: item['short_desc'],
            slug: item['slug'],
            hard_cap: '3000K',
            subscribers: 0,
            mint: item.mint,
            whitelist_end_date: 1643500800000,
            whitelist_start_date: 0,
            distribution_end_date: 0,
            distribution_start_date: 0,
            date_preparation: 0,
            sales_end_date: 0,
            sales_start_date: 0,
            token_price: 0,
            investors: 0,
            ath: 0,
            price_token: '',
            swapLink: '',
            projectLink: '',
            var100: 0,
            price_token_mint: '',
            twitter_link: '',
            share_link: '',
            dateend: ''
          }

          if (!item['title']) {
            continue
          }

          project.twitter_link = item.twitter_link

          var curdate = (new Date() as any) * 1

          project.distribution_end_date = (item.ts_date_distribution + 86400 * 31) * 1000
          project.distribution_start_date = item.ts_date_distribution * 1000
          project.date_preparation = item.ts_date_preparation * 1000
          project.sales_end_date = item.ts_date_sale_end * 1000
          project.sales_start_date = item.ts_date_sale_start * 1000
          project.whitelist_end_date = item.ts_date_whitelist_end * 1000
          project.whitelist_start_date = item.ts_date_whitelist_start * 1000

          if (item.tba == 1) {
            project.distribution_end_date = 9999999999000
            project.distribution_start_date = 9999999999000
            project.date_preparation = 9999999999000
            project.sales_end_date = 9999999999000
            project.sales_start_date = 9999999999000
            project.whitelist_end_date = 9999999999000
            project.whitelist_start_date = 9999999999000
          }

          if (item.token_price == undefined && item.tba != 1) {
            continue
          }

          const decimals = this.spTOKENS[item.price_token_mint].decimals
          project.token_price = item.token_price
          //    project.token_price = item.token_price / (Math.pow(10, 9 - item.token_decimal) * Math.pow(10, decimals))

          if (item.closed == 1) {
            project.status = 'Funded'
          } else if (curdate > project.distribution_end_date && item.closed == 1) {
            project.status = 'Funded'
          } else if (curdate > project.distribution_start_date) {
            project.status = 'Distribution'
          } else if (curdate > project.sales_end_date) {
            project.status = 'Distribution'
          } else if (curdate > project.sales_start_date) {
            project.status = 'Sales'
          } else if (curdate > project.whitelist_end_date) {
            project.status = 'Sales'
          } else if (curdate > project.whitelist_start_date) {
            project.status = 'Whitelist Open'
          } else if (curdate > project.date_preparation) {
            project.status = 'Preparation'
          } else {
            project.status = 'Upcoming'
          }

          if (project.status == 'Whitelist Open' && item.tba != 1 && this.wallet.address) {
            let responseData0

            try {
              responseData0 = await fetch(
                'https://flow.cropper.finance/registers/' + this.wallet.address + '/' + item.mint + '/'
              ).then((res) => res.json())
              project.subscribed = true
            } catch {
              project.subscribed = false
            }
          }

          if (item.ath) {
            project.ath = ((item.ath - item.token_price) / item.token_price) * 100
            project.var100 = Math.round(100 * (1 + project.ath / 100) * 1000) / 1000
          }

          project.swapLink = '/swap/?from=' + item.price_token_mint + '&to=' + project.mint
          project.projectLink = '/launchpad/' + project.slug
          project.dateend = moment(project.distribution_start_date).format('MMMM Do YYYY')

          project.hard_cap = item.pool_size

          let sub = registerdList.find((items: any) => items.mint === item.mint)
          if (sub) {
            project.subscribers = sub.ct
            project.investors = sub.ct
          }

          let token = getTokenByMintAddress(item.price_token_mint)

          if (token) {
            project.price_token = token.symbol
            project.price_token_mint = item.price_token_mint
          }

          if (item.tba == 1) {
            project.status = 'Upcoming'
            project.hard_cap = 'TBA'
          }

          key++
          this.fertilizerData.push(project)
        }

        let fcfsResponse

        try {
          fcfsResponse = await fetch('https://api.cropper.finance/fcfs/').then((res) => res.json())
        } catch {
          // dummy data
        } finally {
        }

        this.fcfsData = []
        for (const item of fcfsResponse.message) {

          let fcfsDat = await getProjectFormatted_round1(item.mint) as any

          let fcfsDat_round2 = await getProjectFormatted_round2(item.mint)  as any

          let token = await getTokenByMintAddress(fcfsDat.main_sale_mint)

          if (token) {
            item.price_token = token.symbol
            item.main_sale_mint = fcfsDat.main_sale_mint
          }

          const decimals = this.spTOKENS[fcfsDat.main_sale_mint].decimals

          fcfsDat.token_price =
            (fcfsDat as any).token_price / (Math.pow(10, 9 - item.token_decimal) * Math.pow(10, decimals))

          item.total_paid_amount = ((fcfsDat as any).total_paid_amount  / fcfsDat.token_price) / (Math.pow(10, 9 - item.token_decimal) * Math.pow(10, decimals))

          if (fcfsDat.token_price != undefined && fcfsDat.token_price > 0) {
            item.total_allocation = Math.round( ( (fcfsDat.total_allocation / fcfsDat.token_price)  / (Math.pow(10, 9 - item.token_decimal) * Math.pow(10, decimals))   )  * 100) / 100
          }

          if(fcfsDat_round2 && fcfsDat_round2.token_price){

            fcfsDat_round2.token_price =
              (fcfsDat_round2 as any).token_price / (Math.pow(10, 9 - item.token_decimal) * Math.pow(10, decimals))

            item.total_paid_amount += ((fcfsDat_round2 as any).total_paid_amount  / fcfsDat_round2.token_price) / (Math.pow(10, 9 - item.token_decimal) * Math.pow(10, decimals))
          }

          item.missing = Math.round((item.total_allocation - item.total_paid_amount) * 100) / 100
          item.fcfsPercent = Math.round(item.total_paid_amount * 10000 / item.total_allocation) / 100

          this.fcfsData.push(item)
        }

      } catch {}
      

    },

    async getTvl() {
      let cur_date = new Date().getTime()
      if (window.localStorage.TVL_last_updated) {
        const last_updated = parseInt(window.localStorage.TVL_last_updated)
        if (cur_date - last_updated <= 600000) {
          this.TVL = window.localStorage.TVL
          return
        }
      }

      let responseData: any = []
      let tvl = 0
      try {
        responseData = await fetch('https://api.cropper.finance/cmc/').then((res) => res.json())

        Object.keys(responseData).forEach(function (key) {
          if ((responseData as any)[key as any].tvl * 1 < 2000000) {
            tvl = tvl * 1 + (responseData as any)[key as any].tvl * 1
          }
        })
      } catch {
        // dummy data
      } finally {
      }

      try {
        responseData = await fetch('https://api.cropper.finance/staking/').then((res) => res.json())
        tvl = tvl * 1 + (responseData as any).value * 1
      } catch {
        // dummy data
      } finally {
      }

      this.TVL = Math.round(tvl)

      window.localStorage.TVL_last_updated = new Date().getTime()
      window.localStorage.TVL = this.TVL
    },
    async flush() {
      clearInterval(this.timer)
      this.poolLoaded = true
      this.countdown = 0
      this.setTimer()
      await this.constructFertilizerData()
    },
    async delay(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },
    setTimer() {
      this.timer = setInterval(async () => {
        if (!this.loading) {
          if (this.countdown < this.autoRefreshTime) {
            this.countdown += 1
            if (this.countdown === this.autoRefreshTime) {
              await this.flush()
            }
          }
        }
      }, 1000)
    },
    reloadTimer() {
      this.flush()
      this.$accessor.wallet.getTokenAccounts()
      this.activeSpinning = true
      setTimeout(() => {
        this.activeSpinning = false
      }, 1000)
    },
    updateFertilizer() {
      this.filterFertilizer(this.searchName, this.filterProject)
    },
    filterFertilizer(searchName: string, filterProject: string) {
      // filter with tabs
      if (filterProject === this.filterOptions.upcoming) {
        this.fertilizerItems = this.fertilizerData.filter(
          (fertilizer: any) => fertilizer.status != this.filterOptions.funded
        )

        // sort by status on Upcoming Projects
        if (this.sortUpcoming === this.filterOptions.all) {
          this.fertilizerItems = this.fertilizerItems.filter(
            (fertilizer: any) => fertilizer.status != this.filterOptions.funded
          )
        } else if (this.sortUpcoming === this.filterOptions.whitelist) {
          this.fertilizerItems = this.fertilizerItems.filter(
            (fertilizer: any) => fertilizer.status === this.filterOptions.whitelist
          )
        } else if (this.sortUpcoming === this.filterOptions.sales) {
          this.fertilizerItems = this.fertilizerItems.filter(
            (fertilizer: any) => fertilizer.status === this.filterOptions.sales
          )
        } else if (this.sortUpcoming === this.filterOptions.distribution) {
          this.fertilizerItems = this.fertilizerItems.filter(
            (fertilizer: any) => fertilizer.status === this.filterOptions.distribution
          )
        } else if (this.sortUpcoming === this.filterOptions.preparation) {
          this.fertilizerItems = this.fertilizerItems.filter(
            (fertilizer: any) => fertilizer.status === this.filterOptions.preparation
          )
        }
      } else {
        this.fertilizerItems = this.fertilizerData.filter(
          (fertilizer: any) => fertilizer.status === this.filterOptions.funded
        )

        // sort by column on Funded projects
        if (this.sortAsc) {
          if (this.sortFunded == this.sortOptions.investors) {
            this.fertilizerItems = this.fertilizerItems.sort((a: any, b: any) => b.investors - a.investors)
          } else if (this.sortFunded == this.sortOptions.total_raised) {
            this.fertilizerItems = this.fertilizerItems.sort((a: any, b: any) => b.hard_cap - a.hard_cap)
          } else if (this.sortFunded == this.sortOptions.token_price) {
            this.fertilizerItems = this.fertilizerItems.sort((a: any, b: any) => b.token_price - a.token_price)
          } else if (this.sortFunded == this.sortOptions.ath) {
            this.fertilizerItems = this.fertilizerItems.sort((a: any, b: any) => b.ath - a.ath)
          } else if (this.sortFunded == this.sortOptions.end_date) {
            this.fertilizerItems = this.fertilizerItems.sort(
              (a: any, b: any) => b.distribution_end_date - a.distribution_end_date
            )
          }
        } else {
          if (this.sortFunded == this.sortOptions.investors) {
            this.fertilizerItems = this.fertilizerItems.sort((a: any, b: any) => a.investors - b.investors)
          } else if (this.sortFunded == this.sortOptions.total_raised) {
            this.fertilizerItems = this.fertilizerItems.sort((a: any, b: any) => a.hard_cap - b.hard_cap)
          } else if (this.sortFunded == this.sortOptions.token_price) {
            this.fertilizerItems = this.fertilizerItems.sort((a: any, b: any) => a.token_price - b.token_price)
          } else if (this.sortFunded == this.sortOptions.ath) {
            this.fertilizerItems = this.fertilizerItems.sort((a: any, b: any) => a.ath - b.ath)
          } else if (this.sortFunded == this.sortOptions.end_date) {
            this.fertilizerItems = this.fertilizerItems.sort(
              (a: any, b: any) => a.distribution_end_date - b.distribution_end_date
            )
          }
        }
      }

      // search with name
      if (searchName != '') {
        this.fertilizerItems = this.fertilizerItems.filter((fertilizer: any) =>
          fertilizer.title.toLowerCase().includes(searchName.toLowerCase())
        )
      }

      // sort by date (Whitelist open > Sales > Open Sales > Distribution > Preparation > Upcoming, Recent Date > Less recent date)
      const sortStatus = [
        { status: 'Whitelist Open', no: 0 },
        { status: 'Sales', no: 1 },
        { status: 'Open Sales', no: 2 },
        { status: 'Distribution', no: 3 },
        { status: 'Preparation', no: 4 },
        { status: 'Upcoming', no: 5 }
      ]

      this.fertilizerItems.forEach((item) => {
        if (item.status === this.filterOptions.sales && this.currentTimestamp > item.sales_start_date)
          item.status = this.filterOptions.open
      })

      this.fertilizerItems = this.fertilizerItems.sort(
        (a: any, b: any) => this.getValueByStatus(sortStatus, a.status) - this.getValueByStatus(sortStatus, b.status)
      )

      this.fertilizerItems.forEach((item) => {
        if (item.status === this.filterOptions.open) item.status = this.filterOptions.sales
      })

      this.showMoreMenu = []
      this.fertilizerItems.forEach((element) => {
        this.showMoreMenu.push(false)
      })
    },
    moment() {
      return moment()
    },
    getValueByStatus(array: any[], value: string) {
      const result = array.find(({ status }) => status === value)
      if (result) {
        return result.no
      }
    },
    getCoinPicUrl() {
      let token
      if (this.mintAddress == NATIVE_SOL.mintAddress) {
        token = NATIVE_SOL
      } else {
        token = Object.values(TOKENS).find((item) => item.mintAddress === this.mintAddress)
      }
      if (token) {
        this.coinName = token.symbol.toLowerCase()
        if (token.picUrl) {
          this.coinPicUrl = token.picUrl
        } else {
          this.coinPicUrl = ''
        }
      }
    },
    goToProject(fertilizer: any) {
      this.$router.push({
        path: '/launchpad/' + fertilizer.slug
      })
    },
    goToProjectFCFS(fertilizer: any) {
      this.$router.push({
        path: '/launchpad/fcfs/' + fertilizer.slug
      })
    },
    sortByStatus(option: string) {
      this.sortUpcoming = option
      this.showFilterMenu = false
      this.filterFertilizer(this.searchName, this.filterProject)
    },
    sortByColumn(option: string) {
      if (this.sortFunded === option) this.sortAsc = !this.sortAsc
      this.sortFunded = option
      this.filterFertilizer(this.searchName, this.filterProject)
    },
    sortByColumnMenu(option: string, asc: boolean) {
      this.sortFunded = option
      this.sortAsc = asc
      this.showFilterMenu = false
      this.filterFertilizer(this.searchName, this.filterProject)
    },
    showMore(idx: number) {
      if (idx != this.currentShowMore) {
        this.showMoreMenu = this.showMoreMenu.map((item) => {
          return false
        })
      }
      this.showMoreMenu = this.showMoreMenu.map((item, i) => {
        if (i === idx) {
          this.currentShowMore = idx
          return !item
        }
        return item
      })
    },
    hideMore() {
      if (this.currentShowMore != -1) {
        this.showMoreMenu = this.showMoreMenu.map((item) => {
          return false
        })
        this.currentShowMore = -1
      }
    },
    changeTab(name: string) {
      this.filterProject = name
    },
    onResize() {
      this.windowWidth = window.innerWidth
    },
    clickFAQ(idx: number) {
      if (idx != this.currentFAQ) {
        this.showFAQ = this.showFAQ.map((item) => {
          return false
        })
      }
      this.showFAQ = this.showFAQ.map((item, i) => {
        if (i === idx) {
          this.currentFAQ = idx
          return !item
        }
        return item
      })
    }
  }
})
</script>

<style lang="less" scoped>
// global stylesheet
.fertilizer {
  .btn-container {
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 48px;
    padding: 3px;
    height: auto;
  }

  .btn-transparent {
    background: transparent;
    border-radius: 48px;
    border: none;
    height: auto;
    width: 100%;
    padding: 7.5px 0;
  }

  .btn-primary {
    background: @color-blue700;
    border-radius: 48px;
    border: none;
    height: auto;
    width: auto;
    padding: 4.5px 23.5px;
  }

  .option-sort-collapse {
    position: absolute;
    top: 50px;
    background: @gradient-color-primary;
    background-origin: border-box;
    border: 2px solid rgba(255, 255, 255, 0.14);
    box-shadow: 18px 11px 14px rgba(0, 0, 0, 0.25);
    border-radius: 8px;
    min-width: 188px;
    z-index: 999;

    &.collapse-left {
      left: 0;
    }

    &.collapse-right {
      right: 0;
    }

    .collapse-item {
      padding: 18px 0;
      border-bottom: 1px solid #c4c4c420;

      &:last-child {
        border-bottom: 0;
      }

      &.active-item {
        color: @color-petrol500;
      }

      a {
        color: #fff;
      }
    }
  }

  .project-status {
    padding: 4px 8px;
    border-radius: 6px;

    &.upcoming {
      background: #a262ac;
    }

    &.whitelist {
      background: @color-red600;
    }

    &.sales {
      background: @color-purple500;
    }

    &.distribution {
      background: @color-yellow600;
      color: @color-neutral900;
    }

    &.preparation {
      background: @color-pink600;
    }

    &.open {
      background: @color-green500;
    }

    &.fcfs {
      background: @color-petrol500;
    }
  }

  .project-name {
    .logo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 18px;
    }

    .title {
      text-align: left;

      .short-desc {
        display: block;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }

  .project-ath {
    .value {
      background: @color-petrol400;
      color: @color-blue800;
      padding: 4px 8px;
      border-radius: 4px;
    }
  }

  .info-icon {
    img {
      width: 12px;
      height: 12px;
      margin-right: 8px;
    }
  }

  .arrow-icon {
    transition: all 0.3s;

    &.arrow-up {
      transform: rotate(180deg);
    }
  }

  .twitter-icon {
    width: 24px;
    height: 20px;
    opacity: 0.5;
    margin-left: 16px;
  }

  .social-link {
    color: #fff;

    .social-icon {
      width: 18px;
      height: 18px;
      margin-left: 8px;
    }
  }

  .detail-btn {
    position: absolute;
    right: 0;
    background: none;
    border: none;
    display: flex;
    align-items: center;
  }

  .isDesktop {
    @media @max-lg-tablet {
      display: none;
    }
  }

  .isTablet {
    display: none;

    @media @max-lg-tablet {
      display: unset;
    }

    @media @max-sl-mobile {
      display: none;
    }
  }

  .isMobile {
    display: none;

    @media @max-sl-mobile {
      display: unset;
    }
  }
}

// class stylesheet
.fertilizer.container {
  margin: 38px auto;

  .fundedicon {
    width: 20px;
    border-radius: 50%;
  }

  @media @max-sl-mobile {
    margin: 28px 0;
  }

  .card {
    .card-body {
      padding: 0;

      .fertilizer-head {
        @media @max-sl-mobile {
          display: block !important;
        }

        .title {
          text-align: center;
          position: relative;
          float: left;

          @media @max-sl-mobile {
            margin-bottom: 18px !important;
          }
        }

        .information {
          @media @max-sl-mobile {
            width: 100%;
          }

          .tvl-info {
            margin-right: 18px;
          }

          .action-btn-group {
            .action-btn {
              background: @color-blue600;
              border-radius: 8px;
              height: 32px;
              width: auto;
              padding: 0 6px;
              color: @color-blue100;
              margin-right: 8px;

              &:last-child {
                margin-right: 0;
              }

              img {
                width: 18px;
                height: 18px;
              }

              &.active img {
                transform: rotate(360deg);
                transition: all 1s ease-in-out;
              }
            }
          }
        }
      }

      .fertilizer-option-bar {
        margin: 38px 0;

        @media @max-sl-mobile {
          margin: 28px 0;
        }

        .option-filter-group {
          position: relative;
          display: flex;
          align-items: center;

          .option-filter {
            border: 2px solid @color-blue500;
            border-radius: 8px;
            padding: 0 8px;
            height: 40px;
            margin-left: 18px;

            @media @max-sl-mobile {
              height: 32px;
              padding: 0 4px;
            }

            &:first-child {
              margin-left: 0;
            }

            &.option-filter-fixed {
              width: 40px;

              @media @max-sl-mobile {
                width: 32px;
              }
            }

            &.option-filter-collapse {
              display: none !important;

              @media @max-md-tablet {
                display: flex !important;
              }
            }

            &.option-sort {
              @media @max-md-tablet {
                display: none !important;
              }
            }

            .option-sort-item {
              letter-spacing: 0.15px;

              label {
                color: #eae8f1;
                opacity: 0.5;
                margin-right: 8px;
              }

              .sort-detail {
                display: flex;
                align-items: center;

                .arrow-icon {
                  margin-left: 8px;
                }
              }
            }
          }

          .option-search-collapse {
            position: absolute;
            top: 0;
            left: -209px;
            transition: visibility 0s, opacity 0.5s linear;
            background: @color-blue700;
            border: 2px solid @color-blue500;
            border-radius: 8px;
            padding: 18px;
            z-index: 999;
            width: 250px;

            .collapse-item-header {
              margin-bottom: 10px;
            }

            .collapse-item-body {
              input {
                border: 2px solid @color-blue400;
                border-radius: 8px;
                padding: 8px 18px;
                background-color: transparent;
                color: #ccd1f1;
                width: 100%;

                &:active,
                &:focus,
                &:hover {
                  outline: 0;
                }

                &::placeholder {
                  color: #ccd1f1;
                }
              }
            }
          }
        }
      }

      .project-balance.round {
        width: 80px;
        height: 55px;
        background: #fff;
        border-radius: 18px;

        span {
          background: @gradient-color03;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      .fertilizer-content {
        .fertilizer-project-table {
          background: @color-blue700;
          border: 3px solid @color-blue500;
          border-radius: 18px;

          .project-banner {
            position: relative;
            border-bottom: 3px solid @color-blue500;
            height: 190px;

            @media @max-sl-mobile {
              height: unset;
            }

            .banner {
              width: 100%;
              height: 100%;
              border-radius: 18px 18px 0 0;
            }

            .project-status {
              position: absolute;
              top: 9px;
              left: 13px;
            }
          }

          &.first {
            border: 3px solid @color-petrol500;

            .project-banner {
              border-bottom: 3px solid @color-petrol500;
            }
          }

          .project-details {
            padding: 14px;

            .project-title {
              height: 170px;

              @media @max-sl-mobile {
                height: 111px;
              }

              .short-desc {
                display: block;
                margin-top: 4px;
              }
            }

            .project-info {
              margin-top: 18px;
              height: 48px;

              .project-balance {
                @media @max-lg-tablet {
                  height: 48px;
                }

                .label {
                  color: rgba(255, 255, 255, 0.6);
                }

                .value {
                  .coin-icon {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    margin-right: 8px;
                  }
                }
              }

              &.whitelist-countdown {
                // height: 48px;
                height: 114px;
                background: @color-blue800;
                padding: 8px;
                border-radius: 18px;
              }

              &.fcsb-container {
                @media @max-lg-tablet {
                  display: inline-block !important;

                  .project-balance {
                    margin-bottom: 18px;

                    &:last-child {
                      margin-bottom: 0;
                    }
                  }
                }
              }
            }

            .project-desc {
              &.project-desc-whitelist {
                @media @max-sl-mobile {
                  display: inline-block !important;
                }

                .project-title {
                  width: 50%;

                  @media @max-lg-tablet {
                    width: 60%;
                  }

                  @media @max-sl-mobile {
                    width: 100%;
                  }
                }

                .project-info {
                  margin-top: 0;
                  height: auto;
                  width: 50%;

                  @media @max-lg-tablet {
                    width: 40%;
                  }

                  @media @max-sl-mobile {
                    width: 100%;
                    margin-top: 18px;
                  }
                }
              }
            }
          }

          .fcfs-container {
            margin-top: 16px;
          }

          .btn-container {
            margin-top: 18px;
          }
        }

        .fertilizer-funded-table {
          width: 100%;

          .fertilizer-funded-table-header {
            &.scrollFixed {
              position: sticky;
              background: @color-blue800;
              top: 70px;
              z-index: 999;
              width: 100%;
              transition: 0.3s all ease-in-out;
            }

            .header-column {
              text-align: center;
              padding: 18px 0;
              color: @color-neutral400;

              .header-column-title {
                cursor: pointer;
                display: flex;
                justify-content: center;

                .arrow-icon {
                  margin-left: 4px;
                }

                .sort-icon-active {
                  color: #13ecab;
                }
              }
            }
          }

          .fertilizer-funded-table-body {
            .fertilizer-funded-table-item {
              display: flex;
              align-items: center;
              background: rgba(23, 32, 88, 0.9);
              border-radius: 8px;
              padding: 18px;
              margin-bottom: 8px;
              border: 3px solid transparent;

              &:hover {
                border-color: @color-blue500;
              }

              &:last-child {
                margin-bottom: 0;
              }

              .state {
                text-align: center;

                .show-more {
                  position: relative;
                  width: 20px;
                  margin: auto;

                  .option-sort-collapse {
                    top: 0;
                    right: 25px;
                  }
                }
              }
            }
          }
        }
      }

      .fertilizer-guide {
        margin-top: 60px;
        max-width: 1028px;

        .guide-ido {
          background: @color-blue700;
          padding: 20px 24px;
          border-radius: 8px;
          margin-bottom: 20px;

          .guide-ido-container {
            margin-top: 24px;

            @media @max-sl-mobile {
              display: block;
            }

            .guide-ido-item {
              width: calc((100% - 72px) / 3);
              margin: 0 18px;

              &:first-child {
                margin-left: 0;
              }

              &:last-child {
                margin-right: 0;
              }

              @media @max-sl-mobile {
                width: 100%;
                margin: 0 0 20px 0;
              }

              .item-title {
                .item-no {
                  height: 30px;
                  width: 30px;
                  border-radius: 50%;
                  background: #ffffff80;
                  color: @color-blue700;
                }
              }

              .item-banner {
                height: 115px;
                background: @color-blue800;
                border-radius: 8px;
              }
            }
          }
        }

        .guide-faq {
          .guide-faq-container {
            margin-top: 20px;

            .guide-faq-item {
              background: @color-blue500;
              padding: 24px;
              border-radius: 8px;
              margin: 8px;

              &:last-child {
                margin-bottom: 0;
              }

              &.opened {
                display: block !important;
              }

              .guide-faq-collapse-item {
                margin-top: 20px;

                span {
                  white-space: pre-line;
                }
              }
            }
          }
        }
      }
    }
  }
}

@media @max-lg-tablet {
  .fertilizer.container {
    .state {
      .label {
        display: block;
        color: @color-neutral400;
      }

      .project-ath .value {
        margin-top: 4px;
      }
    }

    .collapse-row {
      background: @color-blue800;
      border-radius: 8px;
      padding: 18px;

      .btn-group {
        .btn-group-item {
          &:last-child {
            margin-top: 18px;
          }
        }

        .btn-container,
        .social-link {
          margin-right: 18px;

          &:last-child {
            margin-right: 0;
          }
        }
      }
    }
  }
}
</style>

<style lang="less">
.fertilizer {
  .project-info .project-balance .value .ant-statistic-content-value {
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    letter-spacing: 0.15px;
  }
}
</style>
