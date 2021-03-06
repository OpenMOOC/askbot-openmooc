%define platform openmooc
%define component askbot
%define version 0.3
%define release 1
%define libname %{component}%{platform}

Summary: Askbot OpenMOOC integration. Default theme and SAML2 authentication
Name: %{platform}-%{component}
Version: %{version}
Release: %{release}

Source0: %{name}-%{version}.tar.gz
Source1: %{platform}-%{component}.conf
Source2: %{platform}-%{component}-local_settings.py
Source3: %{platform}-%{component}-admin.py
Source4: %{platform}-%{component}-server.key
Source5: %{platform}-%{component}-server.crt

License: Apache Software License 2.0
Group: Development/Libraries
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-buildroot
Prefix: %{_prefix}
Vendor: UNED <infouned@adm.uned.es>
URL: https://github.com/OpenMOOC/%{platform}-%{component}

Requires: askbot48 >= 0.7.48.2

Requires: django-celery = 3.0.17
Requires: python-celery = 3.0.20
Requires: python-djangosaml2 = 0.10.0
Requires: python-memcached = 1.48
Requires: python-gunicorn >= 0.14.6
Requires: python-requests >= 1.1.0
Requires: python-psycopg2 = 2.4.2
Requires: python-pip
Requires: python-devel

Requires: memcached = 1.4.4
Requires: nginx
Requires: postgresql-server >= 8.4.13
Requires: supervisor >= 3.0
Requires: xmlsec1 >= 1.2.16
Requires: xmlsec1-openssl >= 1.2.16


%description
Askbot customizations for OpenMOOC
==================================

 * OpenMOOC theme
 * Specific Settings
 * SAML2 integration
 * Custom Locales


%prep
%setup -n %{name}-%{version}


%build
%{__python} setup.py build


%install
%{__python} setup.py install -O1 --skip-build --root %{buildroot}

# /usr/share/doc/openmooc/askbot
install -d -m 755 %{buildroot}/%{_defaultdocdir}/%{platform}/%{component}

# /etc/openmooc/askbot
install -d -m 755 %{buildroot}%{_sysconfdir}/%{platform}/%{component}
install -m 644 %{SOURCE2} %{buildroot}%{_sysconfdir}/%{platform}/%{component}/local_settings.py
install -m 644 askbotopenmooc/utils/instances_creator_conf.py %{buildroot}%{_sysconfdir}/%{platform}/%{component}/

# /etc/openmooc/askbot/instances
install -d -m 755 %{buildroot}%{_sysconfdir}/%{platform}/%{component}/instances

# /var/lib/openmooc/askbot/instances
install -d -m 755 %{buildroot}%{_sharedstatedir}/%{platform}/%{component}/instances

# /etc/openmooc/askbot/certs
install -d -m 755 %{buildroot}%{_sysconfdir}/%{platform}/%{component}/certs/
install -m 440 %{SOURCE4} %{buildroot}%{_sysconfdir}/%{platform}/%{component}/certs/server.key
install -m 440 %{SOURCE5} %{buildroot}%{_sysconfdir}/%{platform}/%{component}/certs/server.crt

# saml2 attribute-maps
install -d -m 755 %{buildroot}%{_sysconfdir}/%{platform}/%{component}/saml2/
cp -a askbotopenmooc/saml2/attribute-maps %{buildroot}%{_sysconfdir}/%{platform}/%{component}/saml2/

# /usr/bin/openmooc-askbot-admin | /usr/bin/openmooc-askbot-instancetool
install -d -m 755 %{buildroot}%{_bindir}/
install -m 755 %{SOURCE3} %{buildroot}%{_bindir}/openmooc-askbot-admin
install -m 755 askbotopenmooc/utils/%{name}-instancetool.py %{buildroot}/%{_bindir}/%{name}-instancetool

# /var/lib/openmooc/askbot
install -d -m 755 %{buildroot}%{_sharedstatedir}/%{platform}/%{component}

# /var/run/openmooc [gunicorn sockets]
install -d -m 770 %{buildroot}%{_localstatedir}/run/openmooc
install -d -m 770 %{buildroot}%{_localstatedir}/run/openmooc/askbot

# /var/log/openmooc
install -d -m 775 %{buildroot}%{_localstatedir}/log/openmooc
install -d -m 775 %{buildroot}%{_localstatedir}/log/openmooc/askbot

# nginx conf
install -d -m 755 %{buildroot}%{_sysconfdir}/nginx/conf.d
install -m 755 %{SOURCE1} %{buildroot}%{_sysconfdir}/nginx/conf.d/%{name}.conf

# /var/lib/openmooc/askbot/media | static
install -d -m 755 %{buildroot}%{_localstatedir}/lib/%{platform}/%{component}/static

#/var/run/openmooc/askbot
install -d -m 755 %{buildroot}%{_localstatedir}/run/%{platform}/%{component}

%pre
## Create group openmooc-askbot
if ! getent group %name > /dev/null ; then
    groupadd %name
fi

## Create custom link for fix xmlsec library load
# xmlsec1 link
if ! [ -e %{_prefix}/lib64/libxmlsec1-openssl.so ]; then
    ln -s %{_prefix}/lib64/libxmlsec1-openssl.so.1 %{_prefix}/lib64/libxmlsec1-openssl.so
fi


%clean
rm -rf $RPM_BUILD_ROOT


%post
## Message to notice about collectstatic
echo "INFO: You must execute openmooc-askbot-admin collectstatic"


%files
%defattr(-,root,root)

%doc docs/ README.rst COPYING

%dir %{_defaultdocdir}/
%dir %{_sysconfdir}/%{platform}
%dir %{_sysconfdir}/%{platform}/%{component}
%dir %{_sysconfdir}/%{platform}/%{component}/certs
%dir %{_sharedstatedir}/%{platform}/%{component}
%dir %{_sharedstatedir}/%{platform}/%{component}/instances
%dir %{_localstatedir}/run/%{platform}/%{component}

%config(noreplace) %{_sysconfdir}/%{platform}/%{component}/certs/server.key
%config(noreplace) %{_sysconfdir}/%{platform}/%{component}/certs/server.crt
%config(noreplace) %{_sysconfdir}/%{platform}/%{component}/local_settings.py*
%config(noreplace) %{_sysconfdir}/%{platform}/%{component}/instances/
%config(noreplace) %{_sysconfdir}/nginx/conf.d/%{name}.conf

%config(noreplace) %{_sysconfdir}/%{platform}/%{component}/saml2/attribute-maps/*py*

%attr(0755,root,%name) %{_bindir}/%{name}-admin
%attr(0755,root,%name) %{_bindir}/%{name}-instancetool

%dir %{python_sitelib}/%{libname}/
%dir %{python_sitelib}/%{libname}/app
%dir %{python_sitelib}/%{libname}/app/management
%dir %{python_sitelib}/%{libname}/app/management/commands
%dir %{python_sitelib}/%{libname}/app/migrations
%dir %{python_sitelib}/%{libname}/app/templates
%dir %{python_sitelib}/%{libname}/app/templates/mooc
%dir %{python_sitelib}/%{libname}/themes/mooc/
%dir %{python_sitelib}/%{libname}/themes/mooc/media
%dir %{python_sitelib}/%{libname}/themes/mooc/media/images
%dir %{python_sitelib}/%{libname}/themes/mooc/media/bootstrap/css
%dir %{python_sitelib}/%{libname}/themes/mooc/media/style
%dir %{python_sitelib}/%{libname}/themes/mooc/templates
%dir %{python_sitelib}/%{libname}/themes/mooc/templates/widgets
%dir %{python_sitelib}/%{libname}/locale/en/LC_MESSAGES/
%dir %{python_sitelib}/%{libname}/locale/es/LC_MESSAGES/
%dir %{python_sitelib}/%{libname}/saml2
%dir %{python_sitelib}/%{libname}/saml2/attribute-maps
%dir %{python_sitelib}/%{libname}/skel_instances

# Check that the skel is in place
%{python_sitelib}/%{libname}/skel_instances/instance_settings.py*
%{python_sitelib}/%{libname}/skel_instances/supervisor.conf
%{python_sitelib}/%{libname}/skel_instances/nginx.conf
%{python_sitelib}/%{libname}/skel_instances/nginx.forward.conf
%{python_sitelib}/%{libname}/skel_instances/__init__.py*

# Check that te openmooc-askbot utilities are in place
%config(noreplace) %{_sysconfdir}/%{platform}/%{component}/instances_creator_conf.py*
%{python_sitelib}/%{libname}/utils/

%dir %{python_sitelib}/%{platform}_%{component}-%{version}-*.egg-info/

%attr(0770,root,%name) %dir %{_localstatedir}/log/openmooc

# Check for the applicationa and saml2 data
%{python_sitelib}/%{libname}/*.py*
%{python_sitelib}/%{libname}/app/*.py*
%{python_sitelib}/%{libname}/app/management/*.py*
%{python_sitelib}/%{libname}/app/management/commands/*.py*
%{python_sitelib}/%{libname}/app/migrations/*.py*
%{python_sitelib}/%{libname}/app/templates/mooc/*.html
%{python_sitelib}/%{libname}/saml2/attribute-maps/*py*

# Check for the OpenMOOC theme
%{python_sitelib}/%{libname}/themes/mooc/media/images/*
%{python_sitelib}/%{libname}/themes/mooc/media/bootstrap/css/bootstrap.css
%{python_sitelib}/%{libname}/themes/mooc/media/style/*.css
%{python_sitelib}/%{libname}/themes/mooc/templates/*.html
%{python_sitelib}/%{libname}/themes/mooc/templates/widgets/*.html

%{python_sitelib}/%{libname}/locale/en/LC_MESSAGES/*
%{python_sitelib}/%{libname}/locale/es/LC_MESSAGES/*

%{python_sitelib}/%{platform}_%{component}-%{version}-*.egg-info/*


%changelog
* Thu Mar 06 2014 Pablo Martín <pmartin@yaco.es> - 0.3-1
- Fix several paths and bugs.
* Thu Sep 10 2013 Alejandro Blanco <ablanco@yaco.es> - 0.1-2
- Fix several paths and bugs.

* Fri Aug 09 2013 Oscar Carballal Prego <ocarballal@yaco.es> - 0.1-1
- Create spec for openmooc-askbot.
